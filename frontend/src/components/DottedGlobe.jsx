
export default function DottedGlobe({ className = "w-28 h-28" }) {
  // Generate realistic curved latitude/longitude dot matrix and continent-like clusters
  const dots = [];
  const radius = 56;
  const cx = 65;
  const cy = 65;

  // Grid of points clipped to circle with varying densities to simulate continents
  for (let lat = -50; lat <= 50; lat += 9) {
    const rAtLat = radius * Math.cos((lat * Math.PI) / 180);
    const y = cy - radius * Math.sin((lat * Math.PI) / 180);
    const numPoints = Math.max(4, Math.round(16 * Math.cos((lat * Math.PI) / 180)));
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI;
      const x = cx + rAtLat * Math.cos(angle);
      
      const isLand = 
        (lat > -10 && lat < 45 && Math.cos(angle) > -0.6 && Math.cos(angle) < 0.4) ||
        (lat > 10 && lat < 50 && Math.cos(angle) >= 0.3) ||
        (lat < 20 && lat > -40 && Math.cos(angle) < -0.4);
        
      dots.push({
        x,
        y,
        r: isLand ? 1.3 : 0.85,
        opacity: isLand ? 0.45 : 0.18
      });
    }
  }

  return (
    <svg
      viewBox="0 0 130 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke="#455443"
        strokeWidth="0.8"
        strokeDasharray="2 3"
        strokeOpacity="0.22"
      />
      <ellipse
        cx={cx}
        cy={cy}
        rx={radius}
        ry={radius * 0.36}
        stroke="#455443"
        strokeWidth="0.7"
        strokeDasharray="1.5 3.5"
        strokeOpacity="0.16"
      />
      <ellipse
        cx={cx}
        cy={cy}
        rx={radius * 0.45}
        ry={radius}
        stroke="#455443"
        strokeWidth="0.7"
        strokeDasharray="1.5 3.5"
        strokeOpacity="0.16"
      />
      {dots.map((dot, idx) => (
        <circle
          key={idx}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill="#314330"
          fillOpacity={dot.opacity}
        />
      ))}
    </svg>
  );
}
