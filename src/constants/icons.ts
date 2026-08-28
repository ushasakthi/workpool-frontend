// expo-symbols renders SF Symbols on iOS and Material Symbols on Android/web —
// every name here has been checked against both platforms' valid symbol sets.
export const Icons = {
  eyeShow: { ios: 'eye', android: 'visibility', web: 'visibility' },
  eyeHide: { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' },
  cloudUpload: { ios: 'icloud.and.arrow.up', android: 'cloud_upload', web: 'cloud_upload' },
  checkCircle: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  errorCircle: { ios: 'exclamationmark.circle', android: 'error', web: 'error' },
  infoCircle: { ios: 'info.circle', android: 'info', web: 'info' },
  arrowRight: { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' },
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
} as const;
