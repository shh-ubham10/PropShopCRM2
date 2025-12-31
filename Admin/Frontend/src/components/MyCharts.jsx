
import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';


const doughnutData = {
  labels: ['A', 'B', 'C'],
  datasets: [{
    data: [30, 40, 30],
  }]
} ;

const barData = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [{
    label: 'Sales',
    data: [10, 20, 15],
  }]
};

export default function MyCharts() {
  return (
    <div>
      <h3>Doughnut</h3>
      <Doughnut data={doughnutData} />
      <h3>Bar</h3>
      <Bar data={barData} />
    </div>
  );
}

const cssVars = getComputedStyle(document.documentElement);
const textColor = cssVars.getPropertyValue('--text')?.trim() || '#111';

const options = {
  plugins: {
    legend: {
      labels: {
        color: textColor, // legend text color
      }
    },
    title: {
      color: textColor
    }
  },
  scales: {
    x: { ticks: { color: textColor }, grid: { color: 'rgba(0,0,0,0.06)' } },
    y: { ticks: { color: textColor }, grid: { color: 'rgba(0,0,0,0.06)' } }
  }
};
