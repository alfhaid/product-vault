import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts() {
  // Excludes invoice_file (base64 image data) from the list view for performance —
  // it's only needed when opening a single product, not when listing all products.
  const { data, error } = await supabase
    .from('products')
    .select('id, name, purchase_date, warranty_date, price, store, notes, tags, invoice_name, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function upsertProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .upsert(product)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// ── Tags ──────────────────────────────────────────────────────────────────────

export async function getTags() {
  const { data, error } = await supabase.from('tags').select('name').order('name')
  if (error) throw error
  return data.map(t => t.name)
}

export async function addTag(name) {
  const { error } = await supabase.from('tags').upsert({ name })
  if (error) throw error
}

export async function deleteTag(name) {
  const { error } = await supabase.from('tags').delete().eq('name', name)
  if (error) throw error
}

export async function renameTag(oldName, newName) {
  // Add new tag
  await supabase.from('tags').upsert({ name: newName })
  // Update all products that have the old tag
  const { data: products } = await supabase.from('products').select('id, tags')
  for (const p of products || []) {
    if (p.tags?.includes(oldName)) {
      await supabase.from('products').update({
        tags: p.tags.map(t => t === oldName ? newName : t)
      }).eq('id', p.id)
    }
  }
  // Delete old tag
  await supabase.from('tags').delete().eq('name', oldName)
}

// ── Maintenance ───────────────────────────────────────────────────────────────

export async function getMaintenanceRecords(productId, status = null) {
  let query = supabase
    .from('maintenance')
    .select('*')
    .eq('product_id', productId)
    .order('date', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPendingMaintenance() {
  const { data, error } = await supabase
    .from('maintenance')
    .select('*, products(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function approveMaintenance(id) {
  const { error } = await supabase.from('maintenance').update({ status: 'approved' }).eq('id', id)
  if (error) throw error
}

export async function addMaintenanceRecord(record) {
  const { data, error } = await supabase
    .from('maintenance')
    .insert(record)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMaintenanceRecord(id) {
  const { error } = await supabase.from('maintenance').delete().eq('id', id)
  if (error) throw error
}
