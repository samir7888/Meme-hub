"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

interface TextElement {
  id: string;
  value: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  isDragging: boolean;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export default function MemeEditor() {
  const pathname = usePathname();
  const imageSrc = decodeURIComponent(pathname.split("/").pop() || "");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([
    {
      id: "top",
      value: "TOP TEXT",
      x: 0.5,
      y: 0.05,
      fontSize: 0.1,
      color: "#FFFFFF",
      fontFamily: "Impact",
      isDragging: false,
      strokeColor: "#000000",
      strokeWidth: 0.004,
      shadowColor: "rgba(0,0,0,0)",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    },
    {
      id: "bottom",
      value: "BOTTOM TEXT",
      x: 0.5,
      y: 0.95,
      fontSize: 0.1,
      color: "#FFFFFF",
      fontFamily: "Impact",
      isDragging: false,
      strokeColor: "#000000",
      strokeWidth: 0.004,
      shadowColor: "rgba(0,0,0,0)",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    },
  ]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [selectedTextElementId, setSelectedTextElementId] = useState<
    string | null
  >(null);

  const selectedTextElement = selectedTextElementId
    ? textElements.find((el) => el.id === selectedTextElementId)
    : null;

  const drawMeme = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;

    if (!canvas || !ctx || !img || !isImageLoaded) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    textElements.forEach((textEl) => {
      ctx.fillStyle = textEl.color;
      ctx.strokeStyle = textEl.strokeColor;
      ctx.lineWidth = canvas.width * textEl.strokeWidth;
      ctx.textAlign = "center";
      ctx.font = `${canvas.height * textEl.fontSize}px ${textEl.fontFamily}`;
      ctx.textBaseline = "top";

      // Apply shadow properties
      ctx.shadowColor = textEl.shadowColor;
      ctx.shadowBlur = textEl.shadowBlur;
      ctx.shadowOffsetX = textEl.shadowOffsetX;
      ctx.shadowOffsetY = textEl.shadowOffsetY;

      const xPos = canvas.width * textEl.x;
      const yPos = canvas.height * textEl.y;

      // Adjust text baseline for bottom text
      if (textEl.id === "bottom" || textEl.y > 0.5) {
        ctx.textBaseline = "alphabetic"; // or 'bottom'
      }

      ctx.fillText(textEl.value.toUpperCase(), xPos, yPos);
      ctx.strokeText(textEl.value.toUpperCase(), xPos, yPos);

      // Reset shadow properties to avoid affecting other elements
      ctx.shadowColor = "rgba(0,0,0,0)";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });
  }, [textElements, isImageLoaded]);

  useEffect(() => {
    drawMeme();
  }, [drawMeme]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    drawMeme();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let foundElement: TextElement | null = null;
    for (let i = textElements.length - 1; i >= 0; i--) {
      const textEl = textElements[i];
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      ctx.font = `${canvas.height * textEl.fontSize}px ${textEl.fontFamily}`;
      const textWidth = ctx.measureText(textEl.value.toUpperCase()).width;
      const textHeight = canvas.height * textEl.fontSize;

      const x = canvas.width * textEl.x;
      let y = canvas.height * textEl.y;

      // Adjust y for hit detection based on textBaseline
      if (textEl.id === "bottom" || textEl.y > 0.5) {
        y -= textHeight; // Approximate top of text for bottom-aligned
      }

      // Simple bounding box check
      if (
        mouseX >= x - textWidth / 2 &&
        mouseX <= x + textWidth / 2 &&
        mouseY >= y &&
        mouseY <= y + textHeight
      ) {
        foundElement = textEl;
        setDraggedElementId(textEl.id);
        setDragOffsetX(mouseX - x);
        setDragOffsetY(mouseY - y);
        break;
      }
    }

    if (foundElement) {
      setTextElements((prev) =>
        prev.map((el) =>
          el.id === foundElement?.id ? { ...el, isDragging: true } : el
        )
      );
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !draggedElementId) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    setTextElements((prev) =>
      prev.map((el) => {
        if (el.id === draggedElementId) {
          const newX = (mouseX - dragOffsetX) / canvas.width;
          const newY = (mouseY - dragOffsetY) / canvas.height;
          return { ...el, x: newX, y: newY };
        }
        return el;
      })
    );
  };

  const handleMouseUp = () => {
    setDraggedElementId(null);
    setTextElements((prev) => prev.map((el) => ({ ...el, isDragging: false })));
  };

  const addTextField = () => {
    const newId = `text-${Date.now()}`;
    setTextElements((prev) => [
      ...prev,
      {
        id: newId,
        value: "NEW TEXT",
        x: 0.5,
        y: 0.5,
        fontSize: 0.08,
        color: "#FFFFFF",
        fontFamily: "Impact",
        isDragging: false,
        strokeColor: "#000000",
        strokeWidth: 0.004,
        shadowColor: "rgba(0,0,0,0)",
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      },
    ]);
  };

  const removeTextField = (idToRemove: string) => {
    setTextElements((prev) => prev.filter((el) => el.id !== idToRemove));
  };

  const updateTextValue = (id: string, newValue: string) => {
    setTextElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, value: newValue } : el))
    );
  };

  const updateTextProperty = (
    id: string,
    property: keyof TextElement,
    value: any
  ) => {
    setTextElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, [property]: value } : el))
    );
  };

  const handleSelectTextElement = (id: string) => {
    setSelectedTextElementId(id);
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.download = "meme.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const shareMeme = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const filesArray = [
            new File([blob], "meme.png", { type: "image/png" }),
          ];
          if (navigator.canShare && navigator.canShare({ files: filesArray })) {
            try {
              await navigator.share({
                files: filesArray,
                title: "Check out my meme!",
                text: "Created with the Meme Generator",
              });
              console.log("Meme shared successfully");
            } catch (error) {
              console.error("Error sharing meme:", error);
            }
          } else {
            alert(
              "Web Share API not supported in your browser. You can download the meme instead."
            );
          }
        }
      }, "image/png");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-black text-white">
      <h1 className="text-5xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Create Your Meme
      </h1>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        <div className="relative flex-1 bg-gray-800 rounded-lg shadow-lg p-4 flex items-center justify-center">
          <img
            ref={imageRef}
            src={`${process.env.NEXT_PUBLIC_IMAGEKIT_URL}/${imageSrc}`}
            alt="Meme Template"
            className="max-w-full max-h-[60vh] object-contain hidden"
            onLoad={handleImageLoad}
            crossOrigin="anonymous" // Important for canvas toDataURL if image is from different origin
          />
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[60vh] object-contain border border-gray-700 rounded-md cursor-grab"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // End drag if mouse leaves canvas
          ></canvas>
        </div>

        <div className="flex-1 flex flex-col gap-6 bg-gray-800 rounded-lg shadow-lg  p-1 md:p-6">
          <button
            onClick={addTextField}
            className="w-full px-4 py-2 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add New Text Field
          </button>

          {textElements.map((textEl) => (
            <div
              key={textEl.id}
              className="flex flex-col gap-2 p-3 bg-gray-700 rounded-md"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (selectedTextElementId === textEl.id) {
                      setSelectedTextElementId(null);
                      return;
                    }
                    handleSelectTextElement(textEl.id)
                  }}
                  className={`px-3 py-2 rounded-lg text-white font-semibold ${
                    selectedTextElementId === textEl.id
                      ? "bg-purple-600"
                      : "bg-gray-600"
                  } hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  {selectedTextElementId === textEl.id ? "UnSelect" : "Select"}
                </button>
                <input
                  type="text"
                  placeholder={`Text for ${textEl.id}`}
                  className="flex-grow p-3 rounded-md bg-gray-600 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  value={textEl.value}
                  onChange={(e) => updateTextValue(textEl.id, e.target.value)}
                />
                {textEl.id !== "top" && textEl.id !== "bottom" && (
                  <button
                    onClick={() => removeTextField(textEl.id)}
                    className="px-3 py-2 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
              {selectedTextElementId === textEl.id && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="flex flex-col text-sm">
                    Font Size:
                    <input
                      type="range"
                      min="0.01"
                      max="0.2"
                      step="0.005"
                      value={textEl.fontSize}
                      onChange={(e) =>
                        updateTextProperty(
                          textEl.id,
                          "fontSize",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full"
                    />
                  </label>
                  <label className="flex flex-col text-sm">
                    Color:
                    <input
                      type="color"
                      value={textEl.color}
                      onChange={(e) =>
                        updateTextProperty(textEl.id, "color", e.target.value)
                      }
                      className="w-full h-8"
                    />
                  </label>
                  <label className="flex flex-col text-sm">
                    Font Family:
                    <select
                      value={textEl.fontFamily}
                      onChange={(e) =>
                        updateTextProperty(
                          textEl.id,
                          "fontFamily",
                          e.target.value
                        )
                      }
                      className="p-2 rounded-md bg-gray-600 border border-gray-500 text-white"
                    >
                      <option value="Impact">Impact</option>
                      <option value="Arial">Arial</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </label>
                  <label className="flex flex-col text-sm">
                    Stroke Color:
                    <input
                      type="color"
                      value={textEl.strokeColor}
                      onChange={(e) =>
                        updateTextProperty(
                          textEl.id,
                          "strokeColor",
                          e.target.value
                        )
                      }
                      className="w-full h-8"
                    />
                  </label>
                  <label className="flex flex-col text-sm">
                    Stroke Width:
                    <input
                      type="range"
                      min="0"
                      max="0.02"
                      step="0.001"
                      value={textEl.strokeWidth}
                      onChange={(e) =>
                        updateTextProperty(
                          textEl.id,
                          "strokeWidth",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full"
                    />
                  </label>
                  <label className="flex flex-col text-sm">
                    Shadow Color:
                    <input
                      type="color"
                      value={textEl.shadowColor}
                      onChange={(e) =>
                        updateTextProperty(
                          textEl.id,
                          "shadowColor",
                          e.target.value
                        )
                      }
                      className="w-full h-8"
                    />
                  </label>
                  <label className="flex flex-col text-sm">
                    Shadow Blur:
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={textEl.shadowBlur}
                      onChange={(e) =>
                        updateTextProperty(
                          textEl.id,
                          "shadowBlur",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full"
                    />
                  </label>
                  <label className="flex flex-col text-sm">
                    Shadow Offset X:
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="1"
                      value={textEl.shadowOffsetX}
                      onChange={(e) =>
                        updateTextProperty(
                          textEl.id,
                          "shadowOffsetX",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full"
                    />
                  </label>
                  <label className="flex flex-col text-sm">
                    Shadow Offset Y:
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="1"
                      value={textEl.shadowOffsetY}
                      onChange={(e) =>
                        updateTextProperty(
                          textEl.id,
                          "shadowOffsetY",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full"
                    />
                  </label>
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-4 mt-4">
            <button
              onClick={downloadMeme}
              className="flex-1 md:px-6 py-3 bg-green-600 rounded-lg text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              Download Meme
            </button>
            <button
              onClick={shareMeme}
              className="flex-1 px-6 py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Share Meme
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}










      
         