-- Enable the pg_net extension for HTTP requests
create extension if not exists http with schema extensions;

-- Create a function to set up storage policies
create or replace function public.create_storage_policies(bucket_name text)
returns void
language plpgsql
as $$
begin
  -- Allow public read access to all files in the bucket
  execute format('create policy "Public Access" on storage.objects for select to public using (bucket_id = %L);', bucket_name);
  
  -- Allow authenticated users to insert files
  execute format('create policy "Authenticated users can upload" on storage.objects for insert to authenticated with check (bucket_id = %L);', bucket_name);
  
  -- Allow users to update their own files
  execute format('create policy "Users can update their own files" on storage.objects for update to authenticated using (auth.uid() = owner and bucket_id = %L);', bucket_name);
  
  -- Allow users to delete their own files
  execute format('create policy "Users can delete their own files" on storage.objects for delete to authenticated using (auth.uid() = owner and bucket_id = %L);', bucket_name);
  
  raise notice 'Created storage policies for bucket %', bucket_name;
  
exception when others then
    raise warning 'Error creating storage policies: %', sqlerrm;
end;
$$;

-- Create a function to create a bucket with proper policies
create or replace function public.create_bucket_with_policies(
  bucket_id text,
  is_public boolean default true,
  file_size_limit int default 5242880, -- 5MB
  allowed_mime_types text[] default '{"image/*"}'
)
returns void
language plpgsql
as $$
begin
  -- Create the bucket
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (bucket_id, bucket_id, is_public, file_size_limit, allowed_mime_types);
  
  -- Create the policies
  perform public.create_storage_policies(bucket_id);
  
  raise notice 'Created bucket % with policies', bucket_id;
  
exception when others then
    raise warning 'Error creating bucket %: %', bucket_id, sqlerrm;
end;
$$;
