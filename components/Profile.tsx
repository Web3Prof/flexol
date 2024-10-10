import React, { useState } from 'react';
import { PencilSquareIcon } from '@heroicons/react/16/solid';
import { CheckCircleIcon } from '@heroicons/react/16/solid';

export const Profile = () => {
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');

    // Function to handle title change
    const handleTitleChange = (e) => {
        setTitle(e.target.value); // Update the state for title
    };

    // Function to handle caption change
    const handleCaptionChange = (e) => {
        setCaption(e.target.value); // Update the state for caption
    };

    return (
        <>
            <div className='flex'>
                <div className='flex flex-col items-start m-3'>
                    {/* <img
                    src="https://placehold.co/90x90"
                    width="90"
                    height="90"
                    className='rounded-[30px] shadow-md'
                    /> */}
                </div>
                <div className='flex flex-col items-start mr-4'>
                    <div className='flex items-center mb-2'>
                        <input
                            placeholder='Name your Flexol'
                            type='text'
                            value={title}
                            onChange={handleTitleChange} // Set title on change
                            autoFocus
                            className='text-4xl font-extrabold py-1 px-2 border-white bg-transparent focus:outline-none text-white'
                        />
                    </div>

                    <div className='flex items-center'>
                        <input
                            type='text'
                            placeholder='Add description'
                            value={caption}
                            onChange={handleCaptionChange} // Set caption on change
                            className='text-xl py-1 px-2 border-white bg-transparent focus:outline-none text-white'
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
