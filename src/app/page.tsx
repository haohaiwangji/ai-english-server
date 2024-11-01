'use client';

import { Button, Card } from "@nextui-org/react";
import { useState } from "react";
import { WordCard } from "@/components/WordCard";
import { AnalysisResult } from "@/types";
import { useErrorToast } from "@/components/ErrorToast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { motion } from "framer-motion";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { showError, ErrorModal } = useErrorToast();
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError("图片大小不能超过5MB");
        return;
      }

      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('分析失败');
        
        const data = await response.json();
        setResult(data);
      } catch (error) {
        console.error('Error:', error);
        showError("图片分析失败");
      } finally {
        setLoading(false);
      }
    }
  };

  const speakDescription = () => {
    if (result && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(result.description.en);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.main 
      className="min-h-screen p-4 bg-gradient-to-b from-blue-50 to-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <ErrorModal />
      {loading && <LoadingSpinner />}
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="flex flex-col items-center gap-6"
          variants={containerVariants}
        >
          <motion.h1 
            className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600"
            variants={itemVariants}
          >
            场景英语学习
          </motion.h1>
          
          <motion.div 
            className="w-full max-w-md"
            variants={itemVariants}
          >
            <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/90">
              <div className="flex flex-col items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload">
                  <Button 
                    color="primary"
                    as="span"
                    className="cursor-pointer transform hover:scale-105 transition-transform"
                    isDisabled={loading}
                    size="lg"
                    variant="shadow"
                  >
                    {loading ? "处理中..." : "上传场景图片"}
                  </Button>
                </label>
                
                {imageUrl && (
                  <motion.div 
                    className="w-full aspect-video relative rounded-xl overflow-hidden shadow-lg"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <img
                      src={imageUrl}
                      alt="上传的场景"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>

          {result && (
            <motion.div 
              className="w-full max-w-4xl space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* 场景描述 */}
              <motion.div variants={itemVariants}>
                <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/90">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                      场景描述
                    </h2>
                    <Button
                      isIconOnly
                      color="primary"
                      variant="light"
                      onClick={speakDescription}
                      className="text-lg hover:scale-110 transition-transform"
                    >
                      🔊
                    </Button>
                  </div>
                  <p className="text-lg mb-3 leading-relaxed">{result.description.en}</p>
                  <p className="text-gray-500">{result.description.zh}</p>
                </Card>
              </motion.div>

              {/* 单词列表 */}
              <motion.div variants={itemVariants}>
                <div className="bg-white/90 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
                  <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                    相关单词
                  </h2>
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    variants={containerVariants}
                  >
                    {result.words.map((word, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <WordCard word={word} />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.main>
  );
}
