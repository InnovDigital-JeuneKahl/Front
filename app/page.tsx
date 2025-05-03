// pages/index.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import Marquee from "react-fast-marquee";
import Logo from "../public/Logo.svg";
import Hero from "../public/Hero.svg";
import img1 from "../public/2-1.svg";
import img2 from "../public/2-2.svg";
import img3 from "../public/2-3.svg";
import Image from "next/image";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// ---------- Data ----------
const navLinks = [
  { label: "Home", href: "#" },
  { label: "Company", href: "#" },
  { label: "Product", href: "#" },
  { label: "Pricing", href: "#" },
];

const heroContent = {
  title: "Clarity in your data.",
  subtitle: "Power in your decisions",
  description:
    "At Freightmate, we believe that organization is the cornerstone of optimization. Our PMS and TMS are meticulously designed to streamline operations to move swiftly and efficiently in the complex world of logistics.",
  cta: {
    text: "Press",
    key: "⏎",
    suffix: "any time to get Started",
  },
};

const dashboardPreview = {
  src: "https://placehold.co/1200x600?text=Dashboard+Preview",
  alt: "Dashboard Preview",
};

const features = [
  {
    img: {
      src: img1,
      alt: "Analytics Chart",
      className: "w-full h-auto",
    },
    title: "Benefit from the best technologies",
    titleClass: "text-indigo-800",
    description:
      "Freightmee revolutionizes logistics with seamless carrier collaboration, eliminating IT hassles. Swiftly allocate trucks and drivers with feedback for efficient operations.",
    reverse: false,
  },
  {
    img: {
      src: img2,
      alt: "Shipments Card",
      className: "w-full h-auto",
    },
    title: "The new way to drive your loading",
    titleClass: "text-pink-600 text-right md:text-left",
    description:
      "Total control of all your loads, to save you time, focus your efforts on the essentials and offer your customers an optimal quality of service.",
    reverse: true,
  },
  {
    img: {
      src: img3,
      alt: "Working Times",
      className: "w-full h-auto",
    },
    title: "Set up and manage an agile transport",
    titleClass: "text-indigo-800",
    description:
      "Freightmee offers a versatile transportation plan, managing daily and weekly volumes with ease. Empower your teams with dedicated support, and efficiently monitor quality to satisfy carriers and ensure optimized logistics.",
    reverse: false,
  },
];

const testimonials = [
  {
    logo: "https://placehold.co/200x80?text=Logo+1",
    text: "“FreightMee Is A Logistics Superhero! Their Tracking Is Like Magic, And The Team Is Always Ready With A Friendly High-Five.”",
    userImg: "https://placehold.co/100x100?text=User+1",
    userName: "Wadji Boumenjel",
    userTitle: "CEO Of Logoipsum",
  },
  {
    logo: "https://placehold.co/200x80?text=Logo+2",
    text: "“FreightMee helped us scale our operations with ease. Their support team is fantastic!”",
    userImg: "https://placehold.co/100x100?text=User+2",
    userName: "Jane Doe",
    userTitle: "COO Of LogiPro",
  },
  {
    logo: "https://placehold.co/200x80?text=Logo+3",
    text: "“The analytics dashboard is a game changer for our business.”",
    userImg: "https://placehold.co/100x100?text=User+3",
    userName: "John Smith",
    userTitle: "Logistics Manager",
  },
];

const trustedLogos = [
  "https://placehold.co/180x70?text=UPS",
  "https://placehold.co/180x70?text=FedEx",
  "https://placehold.co/180x70?text=DHL",
  "https://placehold.co/180x70?text=Maersk",
  "https://placehold.co/180x70?text=Amazon",
  "https://placehold.co/180x70?text=USPS",
  "https://placehold.co/180x70?text=Logitech",
];

// ---------- Components ----------
const FeatureCard = ({ feature }: any) => {
  return (
    <div
      className={`flex flex-col ${
        feature.reverse ? "md:flex-row-reverse" : "md:flex-row"
      } items-center gap-16 w-full mb-32 px-6`}
    >
      <div className="w-full md:w-1/2">
        <Image
          src={feature.img.src}
          alt={feature.img.alt}
          className={feature.img.className}
          width={480}
          height={320}
        />
      </div>
      <div className="w-full md:w-1/2">
        <h3 className={`font-bold text-2xl mb-4 ${feature.titleClass}`}>
          {feature.title}
        </h3>
        <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
      </div>
    </div>
  );
};

const TestimonialCard = ({ testimonial }: any) => {
  return (
    <div className="flex flex-col items-center p-10 my-6">
      <Image 
        src={testimonial.logo} 
        alt="Logo" 
        className="mb-8 h-16 w-auto" 
        width={200} 
        height={80} 
      />
      <p className="text-center text-gray-700 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">{testimonial.text}</p>
      <div className="flex items-center gap-6">
        <Image
          src={testimonial.userImg}
          alt={testimonial.userName}
          className="w-16 h-16 rounded-full object-cover"
          width={64}
          height={64}
        />
        <div>
          <p className="font-semibold text-lg">{testimonial.userName}</p>
          <p className="text-md text-gray-500">{testimonial.userTitle}</p>
        </div>
      </div>
    </div>
  );
};


const CtaBanner = () => {
    return (
      <section className="w-full bg-gradient-to-r from-zinc-800 to-zinc-900 text-white rounded-2xl p-10 md:p-16 mb-20 shadow-xl max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-3">We are at your disposal</h2>
          <div className="flex items-center gap-6 text-base mt-4 text-gray-300 flex-wrap">
            <span>📞 +213 770 80 80 00</span>
            <span>✉️ contact@freightmee.com</span>
            <span>📍 340 Rue Dar El Heddad, Les Pins Maritimes, Mohammadia, Alger</span>
          </div>
        </div>
        <Link href="/signup" className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-8 py-4 text-lg rounded-full transition-all">
          Get Started →
        </Link>
      </section>
    );
  };

  const Footer = () => {
    return (
      <footer className="w-full bg-white text-gray-600 pt-24 pb-12 px-6 border-t mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <Image src={Logo} alt="FreightMee Logo" className="w-40 mb-6" />
          </div>
  
          {/* Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Product</h4>
            <ul className="space-y-2 text-base">
              <li>Features</li>
              <li>Product</li>
              <li>Shipper</li>
              <li>Carrier</li>
              <li>Pricing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-2 text-base">
              <li>Our Team</li>
              <li>Careers</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Legal Notice</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-2 text-base">
              <li>Blog</li>
              <li>Q&A</li>
              <li>Medium</li>
            </ul>
          </div>
  
          {/* Language Selector */}
          <div className="col-span-2 md:col-span-1 flex items-start md:items-end justify-start md:justify-end">
            <select className="border rounded px-4 py-2 text-base">
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 French</option>
            </select>
          </div>
        </div>
  
        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto mt-16 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 border-t pt-8 gap-6">
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-600">LinkedIn</a>
            <a href="#" className="hover:text-indigo-600">Instagram</a>
          </div>
          <p>© 2024 Freightmee. All rights reserved.</p>
        </div>
      </footer>
    );
  };
  

// ---------- Main Page ----------
const LandingPage = () => {
  return (
    <main className="flex flex-col items-center px-8 md:px-12 lg:px-6 w-full">
      {/* Navbar */}
      <nav className="my-10 w-full max-w-7xl">
        <div className="flex justify-between items-center bg-[#f5f3ff] py-4 px-8 rounded-full shadow-sm">
          <div className="flex items-center gap-10">
            <Image src={Logo} alt="FreightMee Logo" className="w-32" width={128} height={40} />
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-indigo-700 font-medium">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-indigo-700 hover:text-indigo-900 font-medium text-lg">
              Login
            </Link>
            <Link href="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-full text-lg transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center my-20 max-w-5xl px-6">
        <h1 className="text-6xl font-bold mb-4">{heroContent.title}</h1>
        <h2 className="text-6xl text-indigo-800 font-bold mb-8">
          {heroContent.subtitle}
        </h2>
        <p className="text-gray-600 text-xl mb-10 max-w-4xl mx-auto leading-relaxed">{heroContent.description}</p>
        <Link href="/signup" className="inline-block bg-indigo-700 text-white px-8 py-4 text-xl rounded-full shadow-lg hover:bg-indigo-800 transition-colors">
          {heroContent.cta.text} <kbd className="mx-1 px-2 py-1 bg-indigo-800 rounded">{heroContent.cta.key}</kbd> {heroContent.cta.suffix}
        </Link>
        <div className="mt-16 shadow-xl rounded-xl overflow-hidden">
          <Image
            src={Hero}
            alt={dashboardPreview.alt}
            className="w-full"
            width={1200}
            height={600}
          />
        </div>
      </section>

      {/* Features */}
      <section className="w-full my-32 max-w-7xl">
        {features.map((feature, i) => (
          <FeatureCard key={i} feature={feature} />
        ))}
      </section>

      {/* Testimonials */}
      <section className="w-full my-32 max-w-7xl">
        <h2 className="text-4xl font-bold text-center mb-16">
          We focus on the efficiency of freight networks
        </h2>
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={50}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          className="py-8"
        >
          {testimonials.map((testimonial, i) => (
            <SwiperSlide key={i}>
              <TestimonialCard testimonial={testimonial} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Trusted by */}
      <section className="w-full my-24 max-w-7xl">
        <h2 className="text-center text-gray-700 text-2xl font-semibold mb-10">
          Trusted by teams at
        </h2>
        <Marquee gradient={false} speed={30} className="py-8">
          {trustedLogos.map((logo, i) => (
            <img
              key={i}
              src={logo}
              alt={`Logo ${i}`}
              className="mx-20 h-16 grayscale hover:grayscale-0 transition-all duration-300"
            />
          ))}
        </Marquee>
      </section>
      <CtaBanner />
      <Footer />

    </main>
  );
};

export default LandingPage;
