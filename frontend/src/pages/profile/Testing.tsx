import React, { useState } from "react";
import { useRef } from "react";
import Slider from "react-slick";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import picA from "../../assets/png/setA.png";
import picB from "../../assets/png/setB.png";
import picC from "../../assets/png/setC.png";
import picD from "../../assets/png/setD.png";
import active from "../../assets/png/active.svg";
import inactive from "../../assets/png/inactive.svg";
import { ArrowLeft, ArrowRight } from "../../assets";


const images = [picA, picB, picC, picD, picB, picC, picA, picD];

interface CarouselProps {
  images: string[];
}

const CustomCarousel: React.FC<CarouselProps> = ({ images }) => {
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
  };

  const goToPrev = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  };

  const goToNext = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto relative">
      <Slider ref={sliderRef} {...settings}>
        {images.map((item, index) => (
          <div key={index}>
            <SingleCard img={item} />
          </div>
        ))}
      </Slider>
      <div className="carousel-controls flex justify-between items-center absolute left-[-120px] right-[-100px] top-[124px] ">
        <span onClick={goToPrev} className="cursor-pointer">
          <ArrowLeft />
        </span>
        <span onClick={goToNext} className="cursor-pointer">
          <ArrowRight />
        </span>
      </div>
    </div>
  );
};

const SingleCard = ({ img }: { img: string }) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="lg:w-[200px] lg:h-[257px] cursor-pointer relative  "
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{
        backgroundImage: `url(${img})`,
          backgroundSize: "cover",
        
      }}
    >
      {}
      <span className="absolute bottom-0 left-0 right-0 mx-auto flex justify-center cursor-pointer">
        <img src={show ? active : inactive} alt="activeness" />
      </span>
    </div>
  );
};

const Testing = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#010101] justify-center">
    
      <CustomCarousel images={images} />
    </div>
  );
};

export default Testing;
