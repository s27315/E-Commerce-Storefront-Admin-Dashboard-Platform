import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import type { Category } from '../../types';
import toast from 'react-hot-toast';

const categorySchema = z.object({
  name: z.string().min(1, 'Name required').refine((v) => v.trim().length > 0, 'Cannot be empty'),
  description: z.string().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function CategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: existing } = useQuery<Category>({
    queryKey: ['category', id],
    queryFn: () => api.get(`/categories/${id}`).then((r) => r.data),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (existing) reset({ name: existing.name, description: existing.description || '' });
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (data: CategoryForm) =>
      isEdit ? api.patch(`/categories/${id}`, data) : api.post('/categories', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success(isEdit ? 'Category updated!' : 'Category created!');
      navigate('/admin');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Operation failed');
    },
  });

  return (
    <div className="page">
      <h1>{isEdit ? 'Edit Category' : 'Add New Category'}</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="admin-form">
        <div className="field">
          <label>Name</label>
          <input className={`input${errors.name ? ' input-error' : ''}`} {...register('name')} />
          {errors.name && <span className="error">{errors.name.message}</span>}
        </div>
        <div className="field">
          <label>Description (optional)</label>
          <textarea className="input" rows={3} {...register('description')} />
        </div>
        <div className="btn-row">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || mutation.isPending}>
            {isSubmitting || mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
