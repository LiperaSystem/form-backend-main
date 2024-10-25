const startColor = '#90EE90'; // Light green
const endColor = '#C40000';
const steps = 11;

const generateGradientColors = (
  start: string,
  end: string,
  steps: number
): string[] => {
  const startR = parseInt(start.slice(1, 3), 16);
  const startG = parseInt(start.slice(3, 5), 16);
  const startB = parseInt(start.slice(5, 7), 16);

  const endR = parseInt(end.slice(1, 3), 16);
  const endG = parseInt(end.slice(3, 5), 16);
  const endB = parseInt(end.slice(5, 7), 16);

  const colors = [];

  for (let i = 0; i < steps; i++) {
    const r = Math.floor(startR + ((endR - startR) / (steps - 1)) * i);
    const g = Math.floor(startG + ((endG - startG) / (steps - 1)) * i);
    const b = Math.floor(startB + ((endB - startB) / (steps - 1)) * i);

    const color = `#${r.toString(16).padStart(2, '0')}${g
      .toString(16)
      .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    colors.push(color);
  }

  return colors;
};

export const background = generateGradientColors(startColor, endColor, steps);
