"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CloudUpload, Loader2Icon, WandSparkles, X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid';
import React, { ChangeEvent, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import axios from 'axios'
import { uuid } from 'drizzle-orm/pg-core'
import { useAuthContext } from '@/app/provider'
import { useRouter } from 'next/navigation'
import Constants from '@/data/Constants'
import { toast } from 'sonner'
import Image from 'next/image'

function ImageUpload() {

    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null);
    const [model, setModel] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const { user } = useAuthContext();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const OnImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            console.log(files[0])
            const imageUrl = URL.createObjectURL(files[0]);
            setFile(files[0]);
            setPreviewUrl(imageUrl);
        }
    }

    const OnConvertToCodeButtonClick = async () => {
        if (!file || !model || !description) {
            toast.error("Please fill all fields");
            return;
        }
        setLoading(true);
        const fileName = Date.now() + '.png';
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result?.toString().split(",")[1];
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    file: base64String,
                    fileName: fileName,
                }),
            });
            const uploadData = await uploadRes.json();
            const imageUrl = uploadData.url;
            if (!imageUrl) {
                toast.error("Image upload failed. Please try again.");
                setLoading(false);
                return;
            }
            const uid = uuidv4();
            try {
                const result = await axios.post('/api/wireframe-code', {
                    uid,
                    description,
                    imageUrl,
                    model,
                    email: user?.email,
                    createdAt: new Date().toISOString()
                });
                if (result.data?.error) {
                    toast.error("Not Enough Credits!");
                    setLoading(false);
                    return;
                }
                toast.success("Saved to database! Generating code...");
                setLoading(false);
                setFile(null);
                setPreviewUrl(null);
                setModel("");
                setDescription("");
                router.push('/view-code/' + uid);
            } catch (error) {
                toast.error("Failed to save to database");
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!previewUrl ? (
                    <div className='p-8 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900 flex flex-col items-center justify-center transition-all hover:border-purple-500/60'>
                       <div className='p-4 bg-purple-500/20 rounded-full mb-4 ring-2 ring-purple-400/50 animate-pulse'>
                            <CloudUpload className='h-8 w-8 text-purple-300' />
                        </div>

                        <h2 className='font-bold text-xl text-gray-100'>UPLOAD WIREFRAME</h2>
                        <p className='text-gray-400 mt-2 text-center text-sm'>
                            DRAG & DROP OR CLICK TO SELECT
                        </p>
                        <div className='mt-6 w-full'>
                            <label htmlFor='imageSelect' className='block'>
                                <div className='px-6 py-3 bg-purple-800 hover:bg-purple-700 text-white font-medium rounded-lg text-center cursor-pointer transition-colors'>
                                    BROWSE FILES
                                </div>
                            </label>
                            <input 
                                type="file" 
                                id='imageSelect'
                                className='hidden'
                                multiple={false}
                                onChange={OnImageSelect}
                                accept="image/*"
                            />
                        </div>
                    </div>
                ) : (
                    <div className='p-5 border-2 border-dashed border-gray-800 rounded-xl relative bg-gray-900'>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className='w-full h-[250px] object-contain rounded-lg'
                        />
                        <button 
                            onClick={() => setPreviewUrl(null)}
                            className='absolute -top-3 -right-3 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-colors ring-2 ring-gray-600'
                        >
                            <X className='h-4 w-4' />
                        </button>
                    </div>
                )}
                
                <div className='p-7 border border-gray-800 rounded-xl bg-gray-900'>
                    <h2 className='font-bold text-xl text-gray-100 mb-6'>CONFIGURATION</h2>
                    
                    <div className='space-y-6'>
                        <div>
                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                                SELECT AI MODEL
                            </label>
                            <Select onValueChange={(value) => setModel(value)}>
                                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-gray-100">
                                    <SelectValue placeholder="CHOOSE MODEL..." />
                                </SelectTrigger>
                                <SelectContent className='bg-gray-900 border-gray-700'>
                                    {Constants?.AiModelList.map((model, index) => (
                                        <SelectItem value={model.name} key={index} className='hover:bg-purple-900/50'>
                                            <div className='flex items-center gap-3'>
                                                <Image 
                                                    src={model.icon} 
                                                    alt={model.name} 
                                                    width={25} 
                                                    height={25} 
                                                    className='rounded-sm'
                                                />
                                                <span className='text-purple-100'>{model.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                                DESCRIPTION
                            </label>
                            <Textarea
                                onChange={(event) => setDescription(event?.target.value)}
                                className='h-[180px] bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
                                placeholder='DESCRIBE YOUR DESIRED WEBPAGE IN DETAIL...'
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='mt-10 flex items-center justify-center'>
                <Button 
                    onClick={OnConvertToCodeButtonClick} 
                    disabled={loading}
                    className='px-8 py-6 text-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 shadow-lg transition-colors text-white font-bold tracking-wider'
                >
                    {loading ? (
                        <Loader2Icon className='h-6 w-6 animate-spin mr-2 text-purple-300' />
                    ) : (
                        <WandSparkles className='h-6 w-6 mr-2 text-purple-300' />
                    )}
                    GENERATE CODE
                </Button>
            </div>
        </div> 
    )
}

export default ImageUpload