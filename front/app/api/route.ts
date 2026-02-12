// app/api/products/route.ts
import { NextResponse } from 'next/server'

const API_1C_URL = process.env.API_1C_URL
const API_1C_USER = process.env.API_1C_USER
const API_1C_PASSWORD = process.env.API_1C_PASSWORD

export async function GET() {
  try {
    const response = await fetch(`${API_1C_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${API_1C_USER}:${API_1C_PASSWORD}`).toString('base64')}`
      }
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${API_1C_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${API_1C_USER}:${API_1C_PASSWORD}`).toString('base64')}`
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
