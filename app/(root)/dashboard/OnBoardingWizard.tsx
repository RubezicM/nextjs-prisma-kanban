'use client'

import { useCreateDefaultBoard } from '@/hooks/use-boards'
import { useEffect, useState } from "react";

const OnboardingWizard = ({userId}:{userId:string}) => {
  const { isPending, isSuccess, mutate } = useCreateDefaultBoard()

  useEffect(() => {
    if (userId) {
      mutate(userId);
    }
  }, [mutate, userId]);

    if (isSuccess) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-xl font-semibold">All set!</h2>
                    <p>Redirecting to your board...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold">Setting up your workspace...</h2>
                <p className="text-gray-600">This will only take a moment</p>
            </div>
        </div>
    )
};

export default OnboardingWizard;
