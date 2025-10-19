import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export interface BiometricCheckResult {
  available: boolean;
  biometryType?: BiometryTypes;
  error?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

class BiometricService {
  /**
   * Check if biometric authentication is available on the device
   */
  async isBiometricAvailable(): Promise<BiometricCheckResult> {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      return {
        available,
        biometryType,
      };
    } catch (error: any) {
      return {
        available: false,
        error: error.message || 'Failed to check biometric availability',
      };
    }
  }

  /**
   * Prompt user for biometric authentication
   */
  async authenticate(promptMessage?: string): Promise<BiometricAuthResult> {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: promptMessage || 'Authenticate to unlock',
        cancelButtonText: 'Use Password',
      });

      return { success };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  }

  /**
   * Get a user-friendly name for the biometry type
   */
  getBiometryTypeName(biometryType?: BiometryTypes): string {
    switch (biometryType) {
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.Biometrics:
        return 'Biometrics';
      default:
        return 'Biometric Authentication';
    }
  }
}

export default new BiometricService();
