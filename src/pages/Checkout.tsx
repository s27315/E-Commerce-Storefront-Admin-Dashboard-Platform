import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { useCart } from '../context/CartContext';
import type { PaymentMethod } from '../types';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Full name required').refine((v) => v.trim().length > 0),
  shippingAddress: z.string().min(1, 'Address required').refine((v) => v.trim().length > 0),
  city: z.string().min(1, 'City required').refine((v) => v.trim().length > 0),
  postalCode: z.string().optional(),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  email: z.string().email('Invalid email'),
  paymentMethod: z.enum(['CREDIT_CARD', 'PAYPAL', 'MOBILE_MONEY', 'CASH_ON_DELIVERY']),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const STEPS = ['Shipping Info', 'Payment', 'Review'];

export default function Checkout() {
  const [step, setStep] = useState(0);
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, getValues, trigger } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'CASH_ON_DELIVERY' },
  });

  const mutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      // Add each cart item to server cart first
      for (const item of items) {
        await api.post('/api/auth/cart/items', {
          productId: item.productId,
          variantId: item.productId, // use productId as variantId fallback
          quantity: item.quantity,
        });
      }
      // Place order from cart
      return api.post('/api/auth/orders', {
        shippingAddress: `${data.shippingAddress}, ${data.city}${data.postalCode ? ', ' + data.postalCode : ''}`,
        paymentMethod: data.paymentMethod,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email,
      });
    },
    onSuccess: () => {
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/profile');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Order failed. Please try again.');
    },
  });

  const nextStep = async () => {
    const fields: (keyof CheckoutForm)[][] = [
      ['fullName', 'shippingAddress', 'city', 'phoneNumber', 'email'],
      ['paymentMethod'],
    ];
    const valid = await trigger(fields[step]);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = (data: CheckoutForm) => mutation.mutate(data);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="page">
      <h1>Checkout</h1>
      <div className="steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`step${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>{s}</div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {step === 0 && (
          <div className="form-section">
            <h2>Shipping Information</h2>
            {[
              { name: 'fullName' as const, label: 'Full Name', type: 'text' },
              { name: 'email' as const, label: 'Email', type: 'email' },
              { name: 'phoneNumber' as const, label: 'Phone Number (10 digits)', type: 'tel' },
              { name: 'shippingAddress' as const, label: 'Shipping Address', type: 'text' },
              { name: 'city' as const, label: 'City', type: 'text' },
              { name: 'postalCode' as const, label: 'Postal Code (optional)', type: 'text' },
            ].map(({ name, label, type }) => (
              <div className="field" key={name}>
                <label>{label}</label>
                <input className={`input${errors[name] ? ' input-error' : ''}`} type={type} {...register(name)} />
                {errors[name] && <span className="error">{errors[name]?.message}</span>}
              </div>
            ))}
            <button type="button" className="btn btn-primary" onClick={nextStep}>Next</button>
          </div>
        )}

        {step === 1 && (
          <div className="form-section">
            <h2>Payment Method</h2>
            <div className="field">
              <label>Payment Method</label>
              <select className={`input${errors.paymentMethod ? ' input-error' : ''}`} {...register('paymentMethod')}>
                {(['CREDIT_CARD', 'PAYPAL', 'MOBILE_MONEY', 'CASH_ON_DELIVERY'] as PaymentMethod[]).map((m) => (
                  <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                ))}
              </select>
              {errors.paymentMethod && <span className="error">{errors.paymentMethod.message}</span>}
            </div>
            <div className="btn-row">
              <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>Back</button>
              <button type="button" className="btn btn-primary" onClick={nextStep}>Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-section">
            <h2>Order Review</h2>
            <div className="review-info">
              <p><strong>Name:</strong> {getValues('fullName')}</p>
              <p><strong>Email:</strong> {getValues('email')}</p>
              <p><strong>Phone:</strong> {getValues('phoneNumber')}</p>
              <p><strong>Address:</strong> {getValues('shippingAddress')}, {getValues('city')} {getValues('postalCode')}</p>
              <p><strong>Payment:</strong> {getValues('paymentMethod').replace(/_/g, ' ')}</p>
            </div>
            <div className="review-items">
              {items.map((i) => (
                <div key={i.id} className="review-item">
                  <span>{i.product.name} × {i.quantity}</span>
                  <span>${(i.product.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="review-item total"><strong>Total</strong><strong>${total.toFixed(2)}</strong></div>
            </div>
            <div className="btn-row">
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
