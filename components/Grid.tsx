import React, { useEffect, useState, useRef } from "react";
import {
   WalletModalProvider,
   WalletDisconnectButton,
   WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import {
   DndContext,
   useSensor,
   PointerSensor,
   rectIntersection,
} from "@dnd-kit/core";

import {
   ShareIcon,
   PresentationChartLineIcon,
   PercentBadgeIcon,
   CurrencyDollarIcon,
   CheckBadgeIcon,
   XCircleIcon,
   WalletIcon,
} from "@heroicons/react/16/solid";

import { Item, ItemProps } from "./Item"; // Import the Item component
import WalletProviderComponent from "./Wallet";
import Profile from "./Profile";
import axios from "axios";
import { strict } from "assert";

// Grid size (150px * 150px)
const GRID_SIZE = 150;

const initialItems: ItemProps[] = [];

export const Grid = () => {
   const containerRef = useRef(null);
   const [items, setItems] = useState<ItemProps[]>(initialItems);
   const [itemId, setItemId] = useState(initialItems.length + 1);
   const [tokenAddress, setTokenAddress] = useState("");
   const [type, setType] = useState("");
   const [formOpened, setFormOpened] = useState(false); // Initialize form type
   const [isClient, setIsClient] = useState(false); // Track client-side rendering
   const { publicKey } = useWallet();
   const [loading, setLoading] = useState(false);
   const [fadeOpacity, setFadeOpacity] = useState(0);
   const [errorMessage, setErrorMessage] = useState("");

   const handleScroll = () => {
      if (containerRef.current) {
         const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
         const maxScroll = scrollHeight - clientHeight;

         // Calculate the opacity based on scroll position (closer to the bottom = more opacity)
         const opacity = Math.min((scrollTop / maxScroll) * 1.5, 1); // Adjust multiplier to control how fast opacity increases
         setFadeOpacity(opacity);
      }
   };

   // Ensuring client-side rendering to avoid hydration issues
   useEffect(() => {
      setIsClient(true); // Only true after the client has mounted
   }, []);

   const handleFormOpened = (type: string) => {
      setFormOpened((prevState) => !prevState);
      setType(type);
   };

   const handleNoWalletError = () => {
      setErrorMessage("No wallet connected");
      setTimeout(() => setErrorMessage(""), 3000); // Remove error message after 3 seconds
   };

   const findAvailablePosition = () => {
      // Create a 2D array to represent the grid's occupied state
      const occupiedPositions = new Set();

      // Mark the grid cells that are occupied
      items.forEach((item) => {
         const gridX = Math.floor(item.x / GRID_SIZE);
         const gridY = Math.floor(item.y / GRID_SIZE);
         occupiedPositions.add(`${gridX}-${gridY}`);
      });

      // Now, find the first available position
      for (let row = 0; row < 10; row++) {
         // assuming a max of 100 rows
         for (let col = 0; col < 6; col++) {
            // max 6 items per row
            const x = col * GRID_SIZE;
            const y = row * GRID_SIZE;

            // If this position is not occupied, return it
            if (!occupiedPositions.has(`${col}-${row}`)) {
               return { x, y };
            }
         }
      }

      // Default return if somehow no available space is found
      return { x: 0, y: 0 };
   };

   const fetchData = async (
      trimmedTokenAddress: string,
      type: string,
      ownerAddress: string
   ) => {
      setLoading(true);
      try {
         const apiUrl = "https://api.dexscreener.com/latest/dex/search?q=";
         const res = await axios.get(`${apiUrl}${trimmedTokenAddress}`);

         const data = res.data.pairs[0];
         const symbol =
            data.quoteToken.address == trimmedTokenAddress
               ? data.quoteToken.symbol
               : data.baseToken.symbol;
         const imgUrl = data.info.imageUrl;

         let value;
         switch (type) {
            case "wl":
               value = data.priceNative.toString();
               break;
            case "tc":
               try {
                  // Call the API to generate the hash
                  const response = await fetch("/api/tradecount", {
                     method: "POST",
                     headers: {
                        "Content-Type": "application/json",
                     },
                     body: JSON.stringify({
                        walletAddress: ownerAddress,
                        tokenMint: trimmedTokenAddress,
                     }),
                  });

                  if (!response.ok) {
                     throw new Error("Error getting trade count");
                  }

                  const { tradeCount } = await response.json();
                  value = tradeCount.toString();
               } catch (error) {
                  console.error("Error getting trade count:", error);
               }
               break;
            case "pnl":
               try {
                  // Call the API to generate the hash
                  const response = await fetch("/api/pnl", {
                     method: "POST",
                     headers: {
                        "Content-Type": "application/json",
                     },
                     body: JSON.stringify({
                        walletAddress2: ownerAddress,
                        tokenMint2: trimmedTokenAddress,
                     }),
                  });
                  console.log(response);
                  if (!response.ok) {
                     throw new Error("Error getting pnl");
                  }

                  const { pnlPercentage } = await response.json();
                  value = pnlPercentage.toString();
               } catch (error) {
                  console.error("Error getting pnl:", error);
               }
               break;
            default:
               setType("");
               break;
         }
         const { x, y } = findAvailablePosition();

         const newItem = {
            id: `${itemId}`,
            type: type,
            x: x,
            y: y,
            value: value,
            symbol: symbol,
            token_address: trimmedTokenAddress,
            token_img_url: imgUrl,
         };

         setItems((prevItems) => [...prevItems, newItem]);
         setItemId((prevItemId) => prevItemId + 1);
      } catch (err) {
         console.error(err.message);
      } finally {
         setLoading(false); // End loading
      }
   };

   const handleElementSubmit = async (
      event: React.FormEvent<HTMLFormElement>
   ) => {
      event.preventDefault();
      console.log(publicKey);
      const trimmedTokenAddress = tokenAddress.trim(); // Trim spaces from the input value
      if (trimmedTokenAddress) {
         await fetchData(trimmedTokenAddress, type, publicKey?.toBase58()); // Pass the trimmed value to fetch data
      }
   };

   // Sensors for pointer input
   const sensors = [useSensor(PointerSensor)];

   const roundToGrid = (value: number, gridSize: number) =>
      Math.round(value / gridSize) * gridSize;

   const handleDragEnd = (event: any) => {
      const { active, delta } = event;

      // Find the currently dragged item
      const currentItem = items.find((item) => item.id === active.id);

      if (!currentItem) return;
      // Get the width of the container
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const maxX = containerWidth - 150; // Assuming each item is 150px wide

      let newX = roundToGrid(currentItem.x + delta.x, GRID_SIZE);
      let newY = roundToGrid(currentItem.y + delta.y, GRID_SIZE);
      console.log(`OLD : newX: ${newX}, newY: ${newY}`);

      newX = newX < 0 ? 0 : newX;
      newX = Math.min(Math.max(newX, 0), maxX);
      newY = newY < 0 ? 0 : newY;
      console.log(`newX: ${newX}, newY: ${newY}`);
      if (!isPositionOccupied(newX, newY)) {
         setItems((items) =>
            items.map((item) =>
               item.id === active.id
                  ? {
                       ...item,
                       x: newX,
                       y: newY,
                    }
                  : item
            )
         );
      } else {
         console.log(`Position ${newX}, ${newY} is occupied, canceling move.`);
      }
   };
   useEffect(() => {
      console.log("Updated items:", items);
   }, [items]);
   const isPositionOccupied = (x: number, y: number) => {
      return items.some((item) => item.x === x && item.y === y);
   };

   return (
      <div>
         {isClient && ( // Only render after the client has mounted
            <>
               <div className="flex justify-between px-4 py-4 lg:justify-end sm:justify-center">
                  <div className="flex space-x-2">
                     <WalletProviderComponent>
                        <WalletMultiButton />
                     </WalletProviderComponent>
                  </div>
               </div>
               <div className="flex flex-col justify-center items-center w-full py-2 mb-8">
                  <div className="flex justify-center items-center w-[90vw] max-w-[90vw]">
                     <Profile />
                  </div>
               </div>
               <div>
                  <DndContext
                     sensors={sensors}
                     collisionDetection={rectIntersection}
                     onDragEnd={handleDragEnd}
                  >
                     <div className="grid-container" ref={containerRef}>
                        {/* Draggable Area */}
                        {items.map((item) => (
                           <Item
                              key={item.id}
                              type={item.type}
                              id={item.id}
                              x={item.x}
                              y={item.y}
                              value={item.value}
                              symbol={item.symbol}
                              token_address={item.token_address}
                              token_img_url={item.token_img_url}
                           />
                        ))}
                        <div
                           className="dynamic-fade-overlay"
                           style={{ opacity: fadeOpacity }} // Dynamically adjust opacity
                        />
                     </div>
                  </DndContext>
               </div>
               <div className="relative w-full floating-bar">
                  {formOpened ? (
                     <div className="relative w-full">
                        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
                           <form
                              onSubmit={handleElementSubmit}
                              className="flex flex-col space-y-2 w-full max-w-md"
                           >
                              <div className="flex items-center space-x-2">
                                 <input
                                    type="text"
                                    placeholder="Token address"
                                    autoFocus={true}
                                    value={tokenAddress}
                                    onChange={(e) =>
                                       setTokenAddress(e.target.value)
                                    }
                                    className="text-1xl font-medium py-2 px-4 border-1 bg-white border-white bg-transparent focus:outline-none text-slate-800 rounded-full w-full"
                                 />

                                 <button
                                    className="mx-1 text-white rounded-full bg-transparent p-2"
                                    onClick={() => handleElementSubmit}
                                 >
                                    <CheckBadgeIcon className="size-7" />
                                 </button>
                                 <button
                                    className="mx-1 text-gray-100 bg-transparent"
                                    onClick={() => setFormOpened(false)}
                                 >
                                    <XCircleIcon className="size-7" />
                                 </button>
                              </div>
                           </form>
                        </div>
                     </div>
                  ) : (
                     <div className="relative w-full">
                        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
                           <div className="flex items-center bg-gray-100 rounded-full p-2 shadow-lg space-x-2">
                              <div className="relative group">
                                 <button
                                    className={`bg-green-400 font-bold p-2 rounded-full focus:outline-none focus:ring-2 me-2 text-white flex items-center ${
                                       !publicKey
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                    }`}
                                    onClick={() =>
                                       publicKey
                                          ? console.log("Flex action")
                                          : handleNoWalletError()
                                    }
                                 >
                                    <ShareIcon className="size-5" />
                                    &nbsp;&nbsp;Flex
                                 </button>
                              </div>

                              <label className="text-slate-900">
                                 | Choose Item
                              </label>

                              {/* WatchList Button */}
                              <div className="relative group">
                                 <button
                                    className={`bg-white p-2 rounded-full mx-1 text-slate-900 ${
                                       !publicKey
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                    }`}
                                    onClick={() =>
                                       publicKey
                                          ? handleFormOpened("wl")
                                          : handleNoWalletError()
                                    }
                                 >
                                    <PresentationChartLineIcon className="size-5" />
                                 </button>
                                 <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    WatchList
                                 </span>
                              </div>

                              {/* PnL Button */}
                              <div className="relative group">
                                 <button
                                    className={`bg-white p-2 rounded-full mx-1 text-slate-900 ${
                                       !publicKey
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                    }`}
                                    onClick={() =>
                                       publicKey
                                          ? handleFormOpened("pnl")
                                          : handleNoWalletError()
                                    }
                                 >
                                    <PercentBadgeIcon className="size-5" />
                                 </button>
                                 <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    PnL
                                 </span>
                              </div>

                              {/* Trade Count Button */}
                              <div className="relative group">
                                 <button
                                    className={`bg-white p-2 rounded-full mx-1 text-slate-900 ${
                                       !publicKey
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                    }`}
                                    onClick={() =>
                                       publicKey
                                          ? handleFormOpened("tc")
                                          : handleNoWalletError()
                                    }
                                 >
                                    <CurrencyDollarIcon className="size-5" />
                                 </button>
                                 <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Trade Count
                                 </span>
                              </div>

                              <div className="relative group">
                                 <div className="w-24 h-12 overflow-hidden">
                                    <Image
                                       src="/FLEXOL.svg"
                                       alt="logo"
                                       className="ml-2 -mt-5"
                                       width={150} // Replace inline style for width
                                       height={90} // Replace inline style for height
                                       style={{ objectFit: "cover" }} // You can keep object-fit if necessary
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </>
         )}

         {loading && (
            <div className="loading-overlay">
               <div className="loader"></div>
            </div>
         )}
         {/* Error Message Display */}
         {errorMessage && (
            <div className="fixed bottom-24 left-0 right-0 flex justify-center z-2">
               <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounceInFadeOut">
                  {errorMessage}
               </div>
            </div>
         )}
      </div>
   );
};

export default Grid;
