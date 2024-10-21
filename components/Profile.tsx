import React, { useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/16/solid";
import { CheckCircleIcon } from "@heroicons/react/16/solid";

export const Profile = () => {
   const [title, setTitle] = useState("");
   const [desc, setDesc] = useState("");

   // Function to handle title change
   const handleTitleChange = (e) => {
      setTitle(e.target.value); // Update the state for title
   };

   // Function to handle desc change
   const handleDescChange = (e) => {
      const value = e.target.value;
      const lines = value.split("\n");

      // Allow input if lines are less than or equal to 3
      if (lines.length <= 3) {
         setDesc(value);
      }
   };

   return (
      <>
         <div className="flex">
            <div className="flex flex-col items-start m-3">
               {/* <img
                    src="https://placehold.co/90x90"
                    width="90"
                    height="90"
                    className='rounded-[30px] shadow-md'
                    /> */}
            </div>
            <div className="flex flex-col items-start mr-4 w-full">
               <div className="flex flex-col items-start w-full">
                  {/* Title Input */}
                  <input
                     placeholder="Name your Flexol"
                     type="text"
                     value={title}
                     onChange={handleTitleChange} // Set title on change
                     autoFocus
                     maxLength={22}
                     className="text-4xl font-extrabold py-1 px-2 border-white bg-transparent focus:outline-none text-white w-full"
                  />
               </div>

               <div className="flex flex-col items-start w-full">
                  {/* Description Textarea */}
                  <textarea
                     placeholder="Add description"
                     value={desc}
                     onChange={handleDescChange} // Set desc on change
                     rows={3} // Set to show 3 lines
                     className="text-xl py-1 px-2 border-white bg-transparent focus:outline-none text-white w-full resize-none mt-4 overflow-hidden"
                  />
               </div>
            </div>
         </div>
      </>
   );
};

export default Profile;
