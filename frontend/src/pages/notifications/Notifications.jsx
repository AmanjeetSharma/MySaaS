import React from 'react'

const Notifications = () => {
    return (
        <div>
            <h1 className='text-2xl font-bold mb-4'>Notifications</h1>
            <p className='text-muted-foreground'>You have no new notifications.</p>

            <h2 className='text-lg font-semibold mt-6 mb-4'>Recent Notifications</h2>
            <div className='space-y-4'>
                <div className='p-4 border rounded-lg bg-secondary/50'>
                    <p className='text-sm'>Your profile was updated successfully.</p>
                    <span className='text-xs text-muted-foreground'>2 hours ago</span>
                </div>
                <div className='p-4 border rounded-lg bg-secondary/50'>
                    <p className='text-sm'>New login from Chrome on Windows.</p>
                    <span className='text-xs text-muted-foreground'>1 day ago</span>
                </div>
                <div className='p-4 border rounded-lg bg-secondary/50'>
                    <p className='text-sm'>Your password was changed successfully.</p>
                    <span className='text-xs text-muted-foreground'>3 days ago</span>
                </div>
            </div>
        </div>
    )
}

export default Notifications
