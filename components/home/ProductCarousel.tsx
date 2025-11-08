import React, { useCallback, useEffect, useState } from "react";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import type { Product } from "@/shared/schema";
import { ProductCard } from "../ProductCard";
import "./styles.css";

type PropType = {
  products: Product[];
  options?: EmblaOptionsType;
};

const ProductCarousel: React.FC<PropType> = ({ products, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, ...options }, [
    AutoScroll({
      playOnInit: true,
      speed: 1,
      stopOnInteraction: true,
      direction: "forward",
    }),
  ]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Cập nhật trạng thái isPlaying khi autoplay start/stop
  useEffect(() => {
    const autoScroll = emblaApi?.plugins()?.autoScroll;
    if (!autoScroll) return;

    setIsPlaying(autoScroll.isPlaying());

    const onPlay = () => setIsPlaying(true);
    const onStop = () => setIsPlaying(false);

    emblaApi.on("autoScroll:play", onPlay).on("autoScroll:stop", onStop);

    return () => {
      emblaApi.off("autoScroll:play", onPlay).off("autoScroll:stop", onStop);
    };
  }, [emblaApi]);

  // Stop/play khi hover vào carousel
  useEffect(() => {
    if (!emblaApi) return;
    const autoScroll = emblaApi.plugins().autoScroll;
    if (!autoScroll) return;

    const handleMouseEnter = () => autoScroll.stop();
    const handleMouseLeave = () => autoScroll.play();

    const rootNode = emblaApi.rootNode();
    rootNode.addEventListener("mouseenter", handleMouseEnter);
    rootNode.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      rootNode.removeEventListener("mouseenter", handleMouseEnter);
      rootNode.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [emblaApi]);

  return (
    <div className="embla container mx-auto">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container flex gap-6 py-4">
          {products.map((product, index) => (
            <div
              className="embla__slide max-w-[300px] transform transition-transform duration-300 hover:scale-105"
              key={product.id}
            >
              <ProductCard product={product} variant="carousel" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;
