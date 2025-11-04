/**
 * Reproduce un sonido de notificación para alertas de leads nuevos
 * Utiliza Web Audio API para generar un sonido sin necesidad de archivos
 */
export const playLeadNotificationSound = () => {
  try {
    // Crear un contexto de audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Crear un oscilador para generar el tono
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Conectar el oscilador al nodo de ganancia y al destino
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar el tono (frecuencia, tipo de onda)
    oscillator.frequency.value = 800; // Frecuencia en Hz
    oscillator.type = 'sine'; // Tipo de onda
    
    // Configurar la ganancia (volumen) con un fade in/out suave
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01); // Fade in rápido
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3); // Fade out
    
    // Reproducir el sonido (300ms)
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    // Repetir una vez más para un efecto de "ding-ding"
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.value = 1000; // Frecuencia más alta para el segundo tono
      oscillator2.type = 'sine';
      
      gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      
      oscillator2.start();
      oscillator2.stop(audioContext.currentTime + 0.3);
    }, 200);
    
  } catch (error) {
    console.error('Error al reproducir sonido de notificación:', error);
    // Fallback: Intentar reproducir un sonido desde archivo si existe
    try {
      const audio = new Audio('/sounds/lead-notification.mp3');
      audio.volume = 0.7;
      audio.play().catch((e) => console.error('Error playing sound file:', e));
    } catch (fallbackError) {
      console.error('Error en fallback de sonido:', fallbackError);
    }
  }
};

/**
 * Reproduce vibración en dispositivos móviles (si está disponible)
 */
export const vibrateDevice = () => {
  if ('vibrate' in navigator) {
    try {
      // Patrón de vibración: vibra 200ms, pausa 100ms, vibra 200ms
      navigator.vibrate([200, 100, 200]);
    } catch (error) {
      console.error('Error al vibrar dispositivo:', error);
    }
  }
};
