/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Button } from '@/components/ui/button'
import { v4 as uuid } from 'uuid'
import { useNavigate } from 'react-router-dom';


function CreateRoom() {

  const navigate = useNavigate();

  function createId() {
    const id = uuid();
    navigate(`/room${id}`)
  }

  return (
    <>
    <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
  <h1 className="text-2xl font-semibold text-center">
    Cross-Drop is a file sharing platform
  </h1>
  <Button onClick={createId} variant="outline" className="text-white">
    Share
  </Button>
</div>

    </>
  )
}

export default CreateRoom