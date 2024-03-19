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
    const [reportStatus, setReportStatus] = useState(details.status);
    const [reportReasons, setReportReasons] = useState(details.otherReasons === "" ? details.reasons : [...details.reasons, details.otherReasons]);
    const [reportedBy, setReportedBy] = useState(details.reportedBy);
    const [reportedAt, setReportedAt] = useState(handleDateFormat(details.createdAt));
    const [additionalDetails, setAdditionalDetails] = useState(details.description !== "" ? details.description : "None");

    useEffect(() => {
        setReportStatus(details.status);
        setReportReasons(details.otherReasons == "" ? details.reasons : [...details.reasons, details.otherReasons]);
        setReportedBy(details.reportedBy);
        setReportedAt(handleDateFormat(details.createdAt));
        setAdditionalDetails(details.description != "" ? details.description : "None");
    }, [details])

    return (
        <Dialog>
            <DialogTrigger className='flex flex-row justify-between items-center w-full my-3 px-4'>
                <div className='flex flex-row items-center w-full hover:text-muted_blue dark:hover:text-light_yellow hover:cursor-pointer transition-all '>
                    <FontAwesomeIcon icon={faCircleInfo} className='text-4xl text-primary'></FontAwesomeIcon>
                    <span id="report-control" className='ml-4 text-md'>See Report Details</span>
                </div>
                <FontAwesomeIcon icon={faAnglesRight} className='text-3xl text-primary'/>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] lg:max-w-[720px]">
                <DialogHeader>
                    <DialogTitle className="text-center">Report Details</DialogTitle>
                </DialogHeader>
                <hr className="border-b border-muted_blue dark:border-light_yellow my-2 mx-4" />
                <div className='w-full flex flex-col mx-4'>
                    <div className="mb-2 border border-secondary w-fit p-2 rounded-lg">
                        <h3 className='text-md font-semibold'>Report Status: {reportStatus.toUpperCase()}</h3>
                    </div>
                    <div className='flex flex-row gap-4'>
                        <div className="mb-2 border border-secondary w-fit p-2 rounded-lg">
                            <h3 className='text-md font-semibold'>Reported By:</h3>
                            <p className='text-md'>UID: {reportedBy.uid}</p>
                            <p className='text-md'>Username: @{reportedBy.username}</p>
                        </div>
                        <div className="mb-2 border border-secondary w-fit p-2 rounded-lg">
                            <h3 className='text-md font-semibold'>Reported On:</h3>
                            <span className='text-md'>{reportedAt}</span>
                        </div>
                    </div>
                    
                    <div className="mb-2 border border-secondary w-fit p-2 rounded-lg">
                        <h3 className='text-md font-semibold'>Reasons for Report:</h3>
                        <FontAwesomeIcon icon={faAnglesRight} className='text-md text-primary pr-2'/>
                        <span className='text-md capitalize'>
                            {reportReasons.map((reason, index) => (
                                reason + (index < reportReasons.length - 1 ? ', ' : '')
                            ))}
                        </span>
                    </div>
                    <div className="mb-2 border border-secondary w-fit p-2 rounded-lg">
                        <h3 className='text-md font-semibold'>Additional Details:</h3>
                        <p className='text-md'>{additionalDetails}</p>
                    </div>

                </div>

                
                <DialogFooter>
                    <DialogClose className="mt-6">
                        <Button>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
