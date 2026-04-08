import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Category, Product } from '../../types';
import toast from 'react-hot-toast';

const productSchema = z.object({
  title: z.string().min(1, 'Title required').refine((v) => v.trim().length > 0, 'Cannot be empty spaces'),
  description: z.string().min(20, 'Description must be at least 20 characters').refine((v) => v.trim().length > 0),
  brand: z.string().min(1, 'Brand required').refine((v) => v.trim().length > 0, 'Cannot be empty spaces'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  stock: z.coerce.number().int('Stock must be an integer').min(0, 'Stock must be 0 or greater'),
  categoryId: z.string().min(1, 'Category required'),
  images: z.string().min(1, 'At least one image URL required'),
});

type ProductForm = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data: existing } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        description: existing.description,
        brand: existing.brand,
        price: existing.price,
        stock: existing.stock,
        categoryId: existing.category?.id || existing.categoryId || '',
        images: existing.images?.join(', ') || '',
      });
    }
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProductForm) => {
      const payload = {
        ...data,
        images: data.images.split(',').map((s) => s.trim()).filter(Boolean),
      };
      return isEdit ? api.put(`/products/${id}`, payload) : api.post('/products', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      navigate('/admin');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Operation failed');
    },
  });

  const fields: { name: keyof ProductForm; label: string; type?: string; as?: 'textarea' | 'select' }[] = [
    { name: 'title', label: 'Title' },
    { name: 'description', label: 'Description', as: 'textarea' },
    { name: 'brand', label: 'Brand' },
    { name: 'price', label: 'Price', type: 'number' },
    { name: 'stock', label: 'Stock Quantity', type: 'number' },
    { name: 'images', label: 'Image URLs (comma-separated)' },
  ];

  return (
    <div className="page">
      <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="admin-form">
        {fields.map(({ name, label, type, as }) => (
          <div className="field" key={name}>
            <label>{label}</label>
            {as === 'textarea' ? (
              <textarea className={`input${errors[name] ? ' input-error' : ''}`} rows={4} {...register(name)} />
            ) : (
              <input className={`input${errors[name] ? ' input-error' : ''}`} type={type || 'text'} {...register(name)} />
            )}
            {errors[name] && <span className="error">{errors[name]?.message}</span>}
          </div>
        ))}

        <div className="field">
          <label>Category</label>
          <select className={`input${errors.categoryId ? ' input-error' : ''}`} {...register('categoryId')}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <span className="error">{errors.categoryId.message}</span>}
        </div>

        <div className="btn-row">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || mutation.isPending}>
            {isSubmitting || mutation.isPending ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
