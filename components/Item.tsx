// components/Item.tsx
import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import {
   EllipsisHorizontalCircleIcon,
   EllipsisHorizontalIcon,
   MinusIcon,
   TrashIcon,
} from "@heroicons/react/16/solid";
import { pre } from "framer-motion/client";

// Grid size (150px * 150px)
const GRID_SIZE = 150;
const ITEM_GAP = 20;

export interface ItemProps {
   id: string;
   type: string;
   x: number;
   y: number;
   value: string;
   token_address: string;
   token_img_url: string;
   symbol: string;
}

export const Item = ({
   id,
   type,
   x,
   y,
   symbol,
   value,
   token_address,
   token_img_url,
}: ItemProps) => {
   // Use the useDraggable hook from dnd-kit to enable dragging
   const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({ id });

   // const centerX = useMemo(() => window.innerWidth / 2 - GRID_SIZE /2, []);
   // const centerY = useMemo(() => window.innerHeight / 2 - GRID_SIZE / 2, []);

   // Calculate the correct transformation by combining x, y, and current transform
   let finalX = transform?.x ? x + transform.x : x;
   let finalY = transform?.y ? y + transform.y : y;
   finalX = finalX < 0 ? 0 : finalX;
   finalY = finalY < 0 ? 0 : finalY;

   // Style for each item
   const style = {
      position: "absolute",
      width: GRID_SIZE - 10,
      height: GRID_SIZE - 10,
      transform: CSS.Translate.toString({
         x: finalX + ITEM_GAP,
         y: finalY + ITEM_GAP,
      }),
      backgroundColor: isDragging ? "lightgrey" : "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "30px",
      cursor: "grab",
      zIndex: isDragging ? 2 : 1,
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.1)",
   };

   const getFormattedCoeficient = (value: string) => {
      const num = parseFloat(value);

      // If the number is larger than 1000 and not in scientific notation
      if (num >= 1000 && num < 1e6) {
         // Show as '12,3K' or '1000'
         return (num / 1000).toFixed(1).replace(".", ",") + "K";
      }

      // If the number is small and needs scientific notation
      if (num < 0.001) {
         const scientific = num.toExponential();
         const [coeficient] = scientific.split("e");

         // Format the coefficient (2 decimal points, replace '.' with ',' and remove trailing zeros)
         return parseFloat(coeficient)
            .toFixed(2)
            .replace(".", ",")
            .replace(/0+$/, "");
      }

      // Otherwise, return the number as it is if it's small but greater than or equal to 0.001
      return num.toFixed(3).replace(/\.?0+$/, ""); // Remove trailing zeros after decimal point
   };

   const getFormattedExponent = (value: string): string => {
      const num = parseFloat(value);

      // Only apply exponent formatting for small numbers (less than 0.001)
      if (num < 0.001) {
         const scientific = num.toExponential();
         const [, exponent] = scientific.split("e");

         // Format the exponent (return as superscript)
         return `10${exponentToSuperscript(parseInt(exponent))}`;
      }

      // Return an empty string if no exponent formatting is needed
      return "";
   };

   // Function to convert exponent to superscript
   const exponentToSuperscript = (exp: number): string => {
      const superscriptMap: { [key: string]: string } = {
         "0": "⁰",
         "1": "¹",
         "2": "²",
         "3": "³",
         "4": "⁴",
         "5": "⁵",
         "6": "⁶",
         "7": "⁷",
         "8": "⁸",
         "9": "⁹",
         "-": "⁻",
      };

      return exp
         .toString()
         .split("")
         .map((char) => superscriptMap[char] || char)
         .join("");
   };

   return (
      <div
         ref={setNodeRef}
         style={style}
         {...attributes}
         {...listeners}
         className="flex flex-col justify-center items-center"
      >
         {/* Row: Image and Symbol ($ABC) */}
         <div className="flex items-center space-x-2">
            {/* Image Container */}
            <div
               className="flex-shrink-0"
               style={{ position: "relative", left: "0" }}
            >
               <img
                  className="rounded-full border border-brown-100"
                  src={token_img_url}
                  alt={symbol}
                  style={{ width: "50px", height: "50px", objectFit: "cover" }} // Fixed size of the image
               />
            </div>

            {/* Symbol Text */}
            <h5
               className="text-1xl font-extrabold text-slate-900"
               style={{ marginLeft: "10px" }}
            >
               {"$" + (symbol ?? "")}
            </h5>
         </div>

         {type === "wl" && (
            <div className="flex items-baseline space-x-1 mt-4">
               {getFormattedExponent(value) ? (
                  <div className="flex items-start">
                     <span className="text-2xl font-extrabold text-purple-700">
                        {getFormattedCoeficient(value)}
                     </span>
                     <span className="text-xs align-super font-extrabold text-gray-700">
                        {getFormattedExponent(value)}
                     </span>
                  </div>
               ) : (
                  /* If not in scientific notation, just show the coefficient */
                  <span className="text-3xl font-extrabold text-purple-700">
                     {getFormattedCoeficient(value)}
                  </span>
               )}

               <label className="font-semibold text-black text-sm">SOL</label>
            </div>
         )}

         {type === "tc" && (
            <div className="flex items-baseline space-x-1 mt-4">
               <span className="text-3xl font-extrabold text-purple-700">
                  {value}x
               </span>
               <label className="font-semibold text-black text-sm">
                  traded
               </label>
            </div>
         )}

         {type === "pnl" && (
            <div className="flex items-baseline space-x-1 mt-4">
               <span className="text-3xl font-extrabold text-purple-700">
                  {value}%
               </span>
               <label className="font-semibold text-black text-sm">
                  {parseFloat(value) >= 0 ? "profit" : "loss"}
               </label>
            </div>
         )}
      </div>
   );
};

export default Item;
