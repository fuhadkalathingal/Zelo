"use client";

import { useState, useEffect } from 'react';

export default function BatchTimer() {
    const [timeLeft, setTimeLeft] = useState('');
    const [batchInfo, setBatchInfo] = useState({ name: '', deliveryTime: '' });

    useEffect(() => {
        const calculateBatch = () => {
            const now = new Date();
            const morningCutoff = new Date(now);
            morningCutoff.setHours(7, 30, 0, 0);

            const eveningCutoff = new Date(now);
            eveningCutoff.setHours(15, 0, 0, 0); // 3:00 PM

            let targetTime;

            if (now < morningCutoff) {
                targetTime = morningCutoff;
                setBatchInfo({ name: 'Morning', deliveryTime: '10:00 AM' });
            } else if (now < eveningCutoff) {
                targetTime = eveningCutoff;
                setBatchInfo({ name: 'Evening', deliveryTime: '5:30 PM' });
            } else {
                // Next day morning batch
                targetTime = new Date(morningCutoff);
                targetTime.setDate(targetTime.getDate() + 1);
                setBatchInfo({ name: 'Morning', deliveryTime: '10:00 AM Tomorrow' });
            }

            const diff = targetTime.getTime() - now.getTime();
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };

        calculateBatch();
        const timer = setInterval(calculateBatch, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
                <span className="text-xl">⏱️</span>
                <div>
                    <p className="font-semibold text-sm sm:text-base">
                        Order now for {batchInfo.name} Delivery
                    </p>
                    <p className="text-emerald-100 text-xs sm:text-sm">
                        Expected by {batchInfo.deliveryTime}
                    </p>
                </div>
            </div>
            <div className="mt-2 sm:mt-0 bg-emerald-700/50 px-3 py-1 rounded-md font-mono text-lg font-bold tracking-wider">
                {timeLeft}
            </div>
        </div>
    );
}
