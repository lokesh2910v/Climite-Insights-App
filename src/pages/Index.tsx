
import React from 'react';
import Layout from '@/pages/Layout';
import Hero from '@/pages/Hero';
import Features from '@/pages/Features';
import About from '@/pages/About';

const Index: React.FC = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      <About />
    </Layout>
  );
};

export default Index;
