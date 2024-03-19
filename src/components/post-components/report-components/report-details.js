"use client"

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { handleDateFormat } from '@/lib/helper-functions';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faAnglesRight } from '@fortawesome/free-solid-svg-icons';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';



export function ReportDetails({ details }) {
    const [loading, setLoading] = useState(false);
    const [reportReasons, setReportReasons] = useState(details.otherReasons === "" ? details.reasons : [...details.reasons, details.otherReasons]);
    const [reportedBy, setReportedBy] = useState(details.reportedBy);
    const [reportedAt, setReportedAt] = useState(handleDateFormat(details.createdAt));
    const [additionalDetails, setAdditionalDetails] = useState(details.description !== "" ? details.description : "None");

    useEffect(() => {
        setReportReasons(details.otherReasons == "" ? details.reasons : [...details.reasons, details.otherReasons]);
        setReportedBy(details.reportedBy);
        setReportedAt(handleDateFormat(details.createdAt));
        setAdditionalDetails(details.description != "" ? details.description : "None");
    }, [details])

    return (
        <div className='w-full flex flex-col px-4'>
            <div className='w-full flex flex-col border border-secondary rounded-lg mt-2'>
                <div className="w-fit p-2 rounded-lg">
                    <span className='text-md font-semibold'>Reported by @{reportedBy.username} on {reportedAt}</span>
                </div>
                
                <div className='flex flex-row gap-4'>
                    <div className="mb-2 w-1/3 p-2 rounded-lg">
                        <h3 className='text-md font-semibold'>Reasons for Report:</h3>
                            <FontAwesomeIcon icon={faAnglesRight} className='text-md text-primary pr-2'/>
                        <span className='text-md capitalize'>
                            {reportReasons.map((reason, index) => (
                                <span key={index}>{reason}{index === reportReasons.length - 1 ? "" : ", "}</span>
                            ))}
                        </span>
                    </div>
                    <div className="mb-2 w-2/3 p-2 rounded-lg">
                        <span className='text-md font-semibold'>Additional Details:</span>
                        <p className='text-md'>{additionalDetails}</p>
                    </div>
                </div>
            </div>
        </div>
        
    );
}
