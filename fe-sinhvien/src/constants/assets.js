// CONSTANTS: ASSETS — Đường dẫn ảnh và SVG tĩnh

export const ASSETS = {
  images: {
    logos: {
      main: `${import.meta.env.BASE_URL}images/logo.png`,
    },
    banners: {
      authBackground:
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1920&q=80',
      studentBackground: `${import.meta.env.BASE_URL}images/sinh viên login.jpg`,
    },
    cards: {
      studentAuth: `${import.meta.env.BASE_URL}images/sinh viên login.jpg`,
    },
    avatars: {
      default: `${import.meta.env.BASE_URL}images/avt.png`,
    },
  },
};

export const SKYLINE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 100' preserveAspectRatio='none'%3E%3Cpath fill='%23000' d='M0,100 L0,80 L20,80 L20,60 L40,60 L40,50 L50,50 L50,30 L70,30 L70,70 L90,70 L90,40 L110,40 L110,80 L130,80 L130,50 L150,50 L150,90 L180,90 L180,40 L210,40 L210,60 L230,60 L230,20 L260,20 L260,70 L280,70 L280,50 L310,50 L310,80 L340,80 L340,30 L370,30 L370,60 L400,60 L400,40 L430,40 L430,80 L460,80 L460,50 L490,50 L490,90 L520,90 L520,20 L550,20 L550,70 L580,70 L580,40 L610,40 L610,60 L640,60 L640,80 L670,80 L670,50 L700,50 L700,90 L730,90 L730,30 L760,30 L760,70 L790,70 L790,40 L820,40 L820,80 L850,80 L850,50 L880,50 L880,90 L910,90 L910,40 L940,40 L940,70 L970,70 L970,50 L1000,50 L1000,100 Z'/%3E%3C/svg%3E")`;
