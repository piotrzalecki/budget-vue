#!/usr/bin/env node

// Debug script to test API responses
const https = require('https')
const http = require('http')

const API_BASE = process.env.API_BASE || 'https://budget-api.zalecki.uk/api/v1'

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http

    const req = client.get(url, res => {
      let data = ''

      res.on('data', chunk => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
          })
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: e.message,
          })
        }
      })
    })

    req.on('error', err => {
      reject(err)
    })

    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

async function testAPI() {
  console.log('Testing API endpoints...')
  console.log('API Base:', API_BASE)
  console.log('---')

  try {
    // Test tags endpoint
    console.log('1. Testing /tags endpoint...')
    const tagsResponse = await makeRequest(`${API_BASE}/tags`)
    console.log('Status:', tagsResponse.status)
    console.log('Content-Type:', tagsResponse.headers['content-type'])
    console.log('Data structure:', {
      isArray: Array.isArray(tagsResponse.data),
      hasData: 'data' in tagsResponse.data,
      dataType: typeof tagsResponse.data,
      keys: Object.keys(tagsResponse.data || {}),
      firstItem: Array.isArray(tagsResponse.data) ? tagsResponse.data[0] : tagsResponse.data,
    })
    console.log('Raw data:', JSON.stringify(tagsResponse.data, null, 2))
    console.log('---')

    // Test transactions endpoint
    console.log('2. Testing /transactions endpoint...')
    const transactionsResponse = await makeRequest(`${API_BASE}/transactions`)
    console.log('Status:', transactionsResponse.status)
    console.log('Content-Type:', transactionsResponse.headers['content-type'])
    console.log('Data structure:', {
      isArray: Array.isArray(transactionsResponse.data),
      hasData: 'data' in transactionsResponse.data,
      dataType: typeof transactionsResponse.data,
      keys: Object.keys(transactionsResponse.data || {}),
      firstItem: Array.isArray(transactionsResponse.data)
        ? transactionsResponse.data[0]
        : transactionsResponse.data,
    })
    console.log(
      'Raw data (first 2 items):',
      JSON.stringify(
        Array.isArray(transactionsResponse.data)
          ? transactionsResponse.data.slice(0, 2)
          : transactionsResponse.data,
        null,
        2
      )
    )
    console.log('---')
  } catch (error) {
    console.error('Error testing API:', error.message)
  }
}

testAPI()
