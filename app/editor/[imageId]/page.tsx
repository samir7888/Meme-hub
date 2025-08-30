"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "../../contexts/UserContext";

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

interface DrawPoint {
  x: number;
  y: number;
}

interface DrawStroke {
  points: DrawPoint[];
  color: string;
  size: number;
}

interface OverlayImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isDragging: boolean;
}

export default function MemeEditor() {
  const pathname = usePathname();
  const imageSrc = decodeURIComponent(pathname.split("/").pop() || "");
  const { isPremium } = useUser();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [selectedTextElementId, setSelectedTextElementId] = useState<
    string | null
  >(null);
  const [showTextInputs, setShowTextInputs] = useState(false);

  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStrokes, setDrawStrokes] = useState<DrawStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawPoint[]>([]);
  const [drawColor, setDrawColor] = useState("#FF0000");
  const [drawSize, setDrawSize] = useState(5);
  const [isDrawMode, setIsDrawMode] = useState(false);

  // Overlay images
  const [overlayImages, setOverlayImages] = useState<OverlayImage[]>([]);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [selectedOverlayImageId, setSelectedOverlayImageId] = useState<
    string | null
  >(null);

  const drawMeme = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;

    if (!canvas || !ctx || !img || !isImageLoaded) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw overlay images
    overlayImages.forEach((overlayImg) => {
      const overlayElement = new Image();
      overlayElement.onload = () => {
        const x = canvas.width * overlayImg.x;
        const y = canvas.height * overlayImg.y;
        const width = canvas.width * overlayImg.width;
        const height = canvas.height * overlayImg.height;
        ctx.drawImage(overlayElement, x, y, width, height);
      };
      overlayElement.src = overlayImg.src;
    });

    // Draw strokes
    drawStrokes.forEach((stroke) => {
      if (stroke.points.length > 1) {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(
          canvas.width * stroke.points[0].x,
          canvas.height * stroke.points[0].y
        );
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(
            canvas.width * stroke.points[i].x,
            canvas.height * stroke.points[i].y
          );
        }
        ctx.stroke();
      }
    });

    // Draw current stroke
    if (currentStroke.length > 1) {
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(
        canvas.width * currentStroke[0].x,
        canvas.height * currentStroke[0].y
      );
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(
          canvas.width * currentStroke[i].x,
          canvas.height * currentStroke[i].y
        );
      }
      ctx.stroke();
    }

    // Draw text elements with boundary constraints
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

      // Constrain text position within canvas bounds
      const textWidth = ctx.measureText(textEl.value.toUpperCase()).width;
      const textHeight = canvas.height * textEl.fontSize;

      let xPos = Math.max(
        textWidth / 2,
        Math.min(canvas.width - textWidth / 2, canvas.width * textEl.x)
      );
      let yPos = Math.max(
        0,
        Math.min(canvas.height - textHeight, canvas.height * textEl.y)
      );

      // Adjust text baseline for bottom text
      if (textEl.id === "bottom" || textEl.y > 0.5) {
        ctx.textBaseline = "alphabetic";
        yPos = Math.max(
          textHeight,
          Math.min(canvas.height, canvas.height * textEl.y)
        );
      }

      ctx.fillText(textEl.value.toUpperCase(), xPos, yPos);
      ctx.strokeText(textEl.value.toUpperCase(), xPos, yPos);

      // Reset shadow properties to avoid affecting other elements
      ctx.shadowColor = "rgba(0,0,0,0)";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });

    // Draw watermark (only for free users)
    if (!isPremium) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = canvas.width * 0.001;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";

      // Calculate font size based on canvas size (smaller than regular text)
      const watermarkFontSize = Math.max(12, canvas.height * 0.025);
      ctx.font = `bold ${watermarkFontSize}px Arial`;

      // Position at bottom left with some padding
      const padding = canvas.width * 0.02;
      const xPos = padding;
      const yPos = canvas.height - padding;

      // Reset shadow for watermark
      ctx.shadowColor = "rgba(0,0,0,0)";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillText("MEME-WAREHOUSE", xPos, yPos);
      ctx.strokeText("MEME-WAREHOUSE", xPos, yPos);
    }
  }, [
    textElements,
    isImageLoaded,
    drawStrokes,
    currentStroke,
    drawColor,
    drawSize,
    overlayImages,
    isPremium,
  ]);

  useEffect(() => {
    drawMeme();
  }, [drawMeme]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    drawMeme();
  };

  // Helper function to get coordinates from mouse or touch event
  const getEventCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { mouseX: 0, mouseY: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ("touches" in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    return { mouseX, mouseY };
  };

  const handleStart = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { mouseX, mouseY } = getEventCoordinates(e);

    if (isDrawMode) {
      setIsDrawing(true);
      const normalizedX = mouseX / canvas.width;
      const normalizedY = mouseY / canvas.height;
      setCurrentStroke([{ x: normalizedX, y: normalizedY }]);
      return;
    }

    // Check for overlay image hit first
    let foundImage: OverlayImage | null = null;
    for (let i = overlayImages.length - 1; i >= 0; i--) {
      const overlayImg = overlayImages[i];
      const x = canvas.width * overlayImg.x;
      const y = canvas.height * overlayImg.y;
      const width = canvas.width * overlayImg.width;
      const height = canvas.height * overlayImg.height;

      if (
        mouseX >= x &&
        mouseX <= x + width &&
        mouseY >= y &&
        mouseY <= y + height
      ) {
        foundImage = overlayImg;
        setDraggedImageId(overlayImg.id);
        setDragOffsetX(mouseX - x);
        setDragOffsetY(mouseY - y);
        break;
      }
    }

    if (foundImage) {
      setOverlayImages((prev) =>
        prev.map((img) =>
          img.id === foundImage?.id ? { ...img, isDragging: true } : img
        )
      );
      return;
    }

    // Check for text element hit
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
        y -= textHeight;
      }

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

  const handleMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { mouseX, mouseY } = getEventCoordinates(e);

    if (isDrawing && isDrawMode) {
      const normalizedX = mouseX / canvas.width;
      const normalizedY = mouseY / canvas.height;
      setCurrentStroke((prev) => [...prev, { x: normalizedX, y: normalizedY }]);
      return;
    }

    if (draggedImageId) {
      setOverlayImages((prev) =>
        prev.map((img) => {
          if (img.id === draggedImageId) {
            const newX = Math.max(
              0,
              Math.min(1 - img.width, (mouseX - dragOffsetX) / canvas.width)
            );
            const newY = Math.max(
              0,
              Math.min(1 - img.height, (mouseY - dragOffsetY) / canvas.height)
            );
            return { ...img, x: newX, y: newY };
          }
          return img;
        })
      );
      return;
    }

    if (draggedElementId) {
      setTextElements((prev) =>
        prev.map((el) => {
          if (el.id === draggedElementId) {
            const newX = Math.max(
              0.1,
              Math.min(0.9, (mouseX - dragOffsetX) / canvas.width)
            );
            const newY = Math.max(
              0.05,
              Math.min(0.95, (mouseY - dragOffsetY) / canvas.height)
            );
            return { ...el, x: newX, y: newY };
          }
          return el;
        })
      );
    }
  };

  const handleEnd = (
    e?:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (e) e.preventDefault();
    if (isDrawing && currentStroke.length > 1) {
      setDrawStrokes((prev) => [
        ...prev,
        { points: currentStroke, color: drawColor, size: drawSize },
      ]);
      setCurrentStroke([]);
    }
    setIsDrawing(false);
    setDraggedElementId(null);
    setDraggedImageId(null);
    setTextElements((prev) => prev.map((el) => ({ ...el, isDragging: false })));
    setOverlayImages((prev) =>
      prev.map((img) => ({ ...img, isDragging: false }))
    );
  };

  const addTextField = () => {
    if (!showTextInputs) {
      setShowTextInputs(true);
      setTextElements([
        {
          id: "text-1",
          value: "YOUR TEXT",
          x: 0.5,
          y: 0.5,
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
    } else {
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
    }
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

  const undoLastStroke = () => {
    setDrawStrokes((prev) => prev.slice(0, -1));
  };

  const eraseAllDrawings = () => {
    setDrawStrokes([]);
    setCurrentStroke([]);
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newId = `overlay-${Date.now()}`;
        setOverlayImages((prev) => [
          ...prev,
          {
            id: newId,
            src: event.target?.result as string,
            x: 0.1,
            y: 0.1,
            width: 0.3,
            height: 0.3,
            isDragging: false,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeOverlayImage = (idToRemove: string) => {
    setOverlayImages((prev) => prev.filter((img) => img.id !== idToRemove));
    if (selectedOverlayImageId === idToRemove) {
      setSelectedOverlayImageId(null);
    }
  };

  const updateOverlayImageProperty = (
    id: string,
    property: keyof OverlayImage,
    value: any
  ) => {
    setOverlayImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, [property]: value } : img))
    );
  };

  const handleSelectOverlayImage = (id: string) => {
    setSelectedOverlayImageId(selectedOverlayImageId === id ? null : id);
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
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      

      <div className="flex mt-32 flex-col md:flex-row gap-8 w-full max-w-6xl">
        <div className="relative flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 md:p-4 flex items-center justify-center border border-gray-200 dark:border-gray-700">
          <img
            ref={imageRef}
            src={`${process.env.NEXT_PUBLIC_IMAGEKIT_URL}/${imageSrc}`}
            alt="Meme Template"
            className="max-w-full max-h-[50vh] md:max-h-[60vh] object-contain hidden"
            onLoad={handleImageLoad}
            crossOrigin="anonymous" // Important for canvas toDataURL if image is from different origin
          />
          <canvas
            ref={canvasRef}
            className={`max-w-full max-h-[50vh] md:max-h-[60vh] object-contain border border-gray-700 rounded-md touch-none ${
              isDrawMode ? "cursor-crosshair" : "cursor-grab"
            }`}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onTouchCancel={handleEnd}
          ></canvas>
        </div>

        <div className="flex-1 flex flex-col gap-4 md:gap-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 md:p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={addTextField}
              className="px-4 py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            >
              {showTextInputs ? "Add Text Field" : "Add Text"}
            </button>
            <button
              onClick={() => setIsDrawMode(!isDrawMode)}
              className={`px-4 py-3 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 text-sm md:text-base ${
                isDrawMode
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  : "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
              }`}
            >
              {isDrawMode ? "Exit Draw" : "Draw"}
            </button>
            <button
              onClick={handleAddPhoto}
              className="px-4 py-3 bg-green-600 rounded-lg text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
            >
              Add Photo
            </button>
          </div>

          {isDrawMode && (
            <div className="p-3 md:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-base md:text-lg font-semibold mb-3">
                Drawing Tools
              </h3>
              <div className="grid grid-cols-2 md:flex gap-3 md:gap-4 items-center">
                <label className="flex flex-col text-sm">
                  Color:
                  <input
                    type="color"
                    value={drawColor}
                    onChange={(e) => setDrawColor(e.target.value)}
                    className="w-full md:w-12 h-10 md:h-8 rounded"
                  />
                </label>
                <label className="flex flex-col text-sm">
                  Size: {drawSize}px
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={drawSize}
                    onChange={(e) => setDrawSize(parseInt(e.target.value))}
                    className="w-full md:w-24"
                  />
                </label>
                <button
                  onClick={undoLastStroke}
                  className="px-3 py-2 bg-yellow-600 rounded-lg text-white font-semibold hover:bg-yellow-700 text-sm"
                >
                  Undo
                </button>
                <button
                  onClick={eraseAllDrawings}
                  className="px-3 py-2 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 text-sm"
                >
                  Erase All
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {overlayImages.length > 0 && (
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold mb-3">Overlay Images</h3>
              {overlayImages.map((overlayImg) => (
                <div
                  key={overlayImg.id}
                  className="flex flex-col gap-2 p-3 bg-gray-200 dark:bg-gray-600 rounded-md mb-3 border border-gray-300 dark:border-gray-500"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={overlayImg.src}
                      alt="Overlay"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="flex-1 text-sm">
                      Image {overlayImg.id.split("-")[1]}
                    </span>
                    <button
                      onClick={() => handleSelectOverlayImage(overlayImg.id)}
                      className={`px-3 py-1 rounded text-white text-sm font-semibold ${
                        selectedOverlayImageId === overlayImg.id
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-gray-500 hover:bg-gray-600"
                      }`}
                    >
                      {selectedOverlayImageId === overlayImg.id
                        ? "Selected"
                        : "Select"}
                    </button>
                    <button
                      onClick={() => removeOverlayImage(overlayImg.id)}
                      className="px-2 py-1 bg-red-600 rounded text-white text-sm hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  {selectedOverlayImageId === overlayImg.id && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <label className="flex flex-col text-sm">
                        Width: {Math.round(overlayImg.width * 100)}%
                        <input
                          type="range"
                          min="0.05"
                          max="1"
                          step="0.05"
                          value={overlayImg.width}
                          onChange={(e) =>
                            updateOverlayImageProperty(
                              overlayImg.id,
                              "width",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full"
                        />
                      </label>
                      <label className="flex flex-col text-sm">
                        Height: {Math.round(overlayImg.height * 100)}%
                        <input
                          type="range"
                          min="0.05"
                          max="1"
                          step="0.05"
                          value={overlayImg.height}
                          onChange={(e) =>
                            updateOverlayImageProperty(
                              overlayImg.id,
                              "height",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full"
                        />
                      </label>
                      <label className="flex flex-col text-sm">
                        X Position: {Math.round(overlayImg.x * 100)}%
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={overlayImg.x}
                          onChange={(e) =>
                            updateOverlayImageProperty(
                              overlayImg.id,
                              "x",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full"
                        />
                      </label>
                      <label className="flex flex-col text-sm">
                        Y Position: {Math.round(overlayImg.y * 100)}%
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={overlayImg.y}
                          onChange={(e) =>
                            updateOverlayImageProperty(
                              overlayImg.id,
                              "y",
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
            </div>
          )}

          {showTextInputs &&
            textElements.map((textEl) => (
              <div
                key={textEl.id}
                className="flex flex-col gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (selectedTextElementId === textEl.id) {
                          setSelectedTextElementId(null);
                          return;
                        }
                        handleSelectTextElement(textEl.id);
                      }}
                      className={`px-3 py-2 rounded-lg text-white font-semibold text-sm ${
                        selectedTextElementId === textEl.id
                          ? "bg-purple-600"
                          : "bg-gray-600"
                      } hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    >
                      {selectedTextElementId === textEl.id
                        ? "UnSelect"
                        : "Select"}
                    </button>
                    {textElements.length > 1 && (
                      <button
                        onClick={() => removeTextField(textEl.id)}
                        className="px-3 py-2 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={`Text for ${textEl.id}`}
                    className="flex-grow p-3 rounded-md bg-gray-600 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm md:text-base"
                    value={textEl.value}
                    onChange={(e) => updateTextValue(textEl.id, e.target.value)}
                  />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <button
              onClick={downloadMeme}
              className="px-4 py-3 bg-green-600 rounded-lg text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm md:text-base"
            >
              Download Meme
            </button>
            <button
              onClick={shareMeme}
              className="px-4 py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm md:text-base"
            >
              Share Meme
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
