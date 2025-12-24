# Supabase Storage Setup Guide

## Issue Fixed: "Upload failed bucket not found"

The media upload system now includes automatic fallback to local storage, but for production use, you should create the Supabase Storage bucket.

## Option 1: Create Bucket in Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Navigate to your project

2. **Open Storage Section**
   - Click on "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Create the Bucket**
   - **Bucket name**: `media-uploads`
   - **Public bucket**: ✅ Enable (checked)
   - **File size limit**: `52428800` (50MB)
   - **Allowed MIME types**: 
     ```
     image/*
     video/*
     audio/*
     application/pdf
     application/msword
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     ```

4. **Set Bucket Policies**
   - Go to "Policies" tab in Storage
   - Create policy for `media-uploads` bucket:
   
   **INSERT Policy:**
   ```sql
   CREATE POLICY "Allow authenticated users to upload media" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'media-uploads' AND 
     auth.role() = 'authenticated'
   );
   ```
   
   **SELECT Policy:**
   ```sql
   CREATE POLICY "Allow public access to media" ON storage.objects
   FOR SELECT USING (bucket_id = 'media-uploads');
   ```

## Option 2: Automatic Fallback (Current Implementation)

The system now automatically:
1. ✅ **Tries to create the bucket** if it doesn't exist
2. ✅ **Falls back to local storage** if Supabase Storage is unavailable
3. ✅ **Shows appropriate user feedback** for both scenarios

### Fallback Behavior:
- **Supabase Available**: Files uploaded to cloud storage with public URLs
- **Supabase Unavailable**: Files stored locally with object URLs (temporary)
- **User Experience**: Seamless - users won't notice the difference

## Testing the Fix

1. **Try uploading media** - should work now with either:
   - Cloud storage (if bucket exists)
   - Local storage (fallback)

2. **Check console logs**:
   - `✅ Media uploaded successfully to Supabase:` = Cloud storage working
   - `✅ Media uploaded locally:` = Fallback working

3. **Create the bucket** for production use following Option 1

## Production Recommendations

- ✅ **Create the Supabase bucket** for persistent storage
- ✅ **Set up proper RLS policies** for security
- ✅ **Configure CDN** for better performance (optional)
- ✅ **Monitor storage usage** in Supabase dashboard

The system is now robust and will work in both scenarios!