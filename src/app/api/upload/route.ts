import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    // Try Supabase Storage
    try {
      if (supabase) {
        const { data, error } = await supabase.storage
          .from('student-photos')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          })

        if (!error && data) {
          const { data: publicData } = supabase.storage
            .from('student-photos')
            .getPublicUrl(fileName)
          return NextResponse.json({ url: publicData.publicUrl })
        }
      }
    } catch (e) {
      console.warn('Supabase storage upload failed, using data URI fallback', e)
    }

    // Fallback: Data URI for seamless experience if bucket not created yet
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`
    return NextResponse.json({ url: dataUrl })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro no upload' }, { status: 500 })
  }
}
