// src/pages/HomePage.jsx

import Team from "../../components/Common/Homes/Team";
import Hero from "../../components/Common/Homes/Hero";
import About from "../../components/Common/Homes/About";
import Service from "../../components/Common/Homes/Service";
const HomePage = () => {
  return (
    <>
      <Hero
        title="Chào mừng đến với Nha Khoa ABC"
        subtitle="Nơi mang đến nụ cười hoàn hảo cho bạn và gia đình."
      />
      <About />
      <Service />
      <Team />
    </>
  );
};

export default HomePage;
