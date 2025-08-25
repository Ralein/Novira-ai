"use client"
import AppHeader from '@/app/_components/AppHeader'
import Constants from '@/data/Constants'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'
import SelectionDetail from '../_components/SelectionDetail'
import CodeEditor from '../_components/CodeEditor'

export interface RECORD {
    id: number
    description: string
    code: string | null
    imageUrl: string
    model: string
    createdBy: string
    uid: string
    error?: string
}

interface ApiError {
    message: string
    status?: number
}

function ViewCode() {
    const { uid } = useParams()
    const [loading, setLoading] = useState(false)
    const [codeResp, setCodeResp] = useState('')
    const [record, setRecord] = useState<RECORD | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    // Get record information from database
    const getRecordInfo = useCallback(async (regen = false) => {
        if (!uid) {
            setError('No UID provided')
            return
        }

        try {
            console.log("Fetching record info...")
            setIsReady(false)
            setCodeResp('')
            setLoading(true)
            setError(null)

            const result = await axios.get(`/api/wireframe-code?uid=${uid}`)
            const resp = result?.data

            if (!resp) {
                throw new Error('No data received from server')
            }

            setRecord(resp)

            // If no code exists or regeneration requested, generate new code
            if (resp.code == null || regen) {
                await generateCode(resp)
            } else {
                setCodeResp(resp.code)
                setLoading(false)
                setIsReady(true)
            }

            if (resp.error) {
                setError(resp.error)
            }
        } catch (err) {
            console.error('Error fetching record:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch record')
            setLoading(false)
        }
    }, [uid])

    // Generate code from wireframe using AI
    const generateCode = async (recordData: RECORD) => {
        if (!recordData) {
            setError('No record data available')
            return
        }

        try {
            setLoading(true)
            setIsGenerating(true)
            setError(null)

            const promptText = recordData.description + ":" + (Constants as any)?.PROMPT

            const res = await fetch('/api/ai-model', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: promptText,
                    model: recordData.model,
                    imageUrl: recordData.imageUrl
                })
            })

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            if (!res.body) {
                throw new Error('No response body received')
            }

            setLoading(false)

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let accumulatedCode = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                
                // Clean up the code by removing markdown formatting
                const cleanedText = chunk
                    .replace(/```jsx/g, '')
                    .replace(/```javascript/g, '')
                    .replace(/```typescript/g, '')
                    .replace(/```/g, '')
                    .replace(/^javascript\s*/g, '')
                    .replace(/^jsx\s*/g, '')
                    .replace(/^typescript\s*/g, '')

                accumulatedCode += cleanedText
                setCodeResp(prev => prev + cleanedText)
            }

            setIsReady(true)
            setIsGenerating(false)

        } catch (err) {
            console.error('Error generating code:', err)
            setError(err instanceof Error ? err.message : 'Failed to generate code')
            setLoading(false)
            setIsGenerating(false)
        }
    }

    // Update generated code to database
    const updateCodeToDb = useCallback(async () => {
        if (!record?.uid || !codeResp) {
            console.warn('Cannot update: missing UID or code response')
            return
        }

        try {
            console.log('Updating code to DB with UID:', record.uid)
            
            const result = await axios.put('/api/wireframe-code', {
                uid: record.uid,
                codeResp: codeResp
            })

            console.log('Code updated successfully:', result.data)
        } catch (err) {
            console.error('Error updating code to DB:', err)
            setError(err instanceof Error ? err.message : 'Failed to update code')
        }
    }, [record?.uid, codeResp])

    // Auto-save generated code to database
    useEffect(() => {
        if (codeResp && record?.uid && isReady && !record.code) {
            updateCodeToDb()
        }
    }, [codeResp, isReady, record, updateCodeToDb])

    // Initial load
    useEffect(() => {
        if (typeof window !== 'undefined' && uid) {
            getRecordInfo()
        }
    }, [uid, getRecordInfo])

    // Handle regenerate code
    const handleRegenerateCode = () => {
        getRecordInfo(true)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader hideSidebar={true} />
            
            <div className='grid grid-cols-1 md:grid-cols-5 p-5 gap-10'>
                <div>
                    <SelectionDetail 
                        record={record} 
                        regenrateCode={handleRegenerateCode}
                        isReady={isReady}
                    />
                </div>
                
                <div className='col-span-4'>
                    {error && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            <h3 className="font-semibold">Error:</h3>
                            <p>{error}</p>
                            <button 
                                onClick={() => getRecordInfo()}
                                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    
                    {loading ? (
                        <div className="bg-slate-100 h-[80vh] rounded-xl flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className='animate-spin w-8 h-8 mx-auto mb-4' />
                                <h2 className='font-bold text-2xl text-gray-700'>
                                    {isGenerating ? 'Generating Code from Wireframe...' : 'Loading...'}
                                </h2>
                                <p className="text-gray-500 mt-2">
                                    This may take a few moments
                                </p>
                            </div>
                        </div>
                    ) : (
                        <CodeEditor 
                            codeResp={codeResp} 
                            isReady={isReady}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default ViewCode