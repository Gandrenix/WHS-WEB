'use client';

import styles from './RollingCube404.module.css';

export function RollingCube404() {
  const stamps = [
    { type: 'four', text: '4' },
    { type: 'zero', text: '0' },
    { type: 'four', text: '4' },
    { type: 'zero', text: '0' },
    { type: 'four', text: '4' },
    { type: 'zero', text: '0' },
    { type: 'four', text: '4' },
    { type: 'zero', text: '0' },
    { type: 'four', text: '4' },
    { type: 'zero', text: '0' },
  ];

  return (
    <div className={styles.container}>
      {/* Rail with 3D Staggered 404 Stamps */}
      <div className={styles.rail}>
        {stamps.map((stamp, idx) => (
          <div key={idx} className={styles.stamp}>
            {stamp.text}
          </div>
        ))}
      </div>

      {/* 3D Rolling Cube World */}
      <div className={styles.world}>
        <div className={styles.forward}>
          <div className={styles.box}>
            <div className={styles.wall}>4</div>
            <div className={styles.wall}>0</div>
            <div className={styles.wall}>4</div>
            <div className={styles.wall}>0</div>
            <div className={styles.wall}>4</div>
            <div className={styles.wall}>0</div>
          </div>
        </div>
      </div>
    </div>
  );
}
