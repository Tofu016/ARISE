import { StyleSheet } from 'react-native';

/**
 * theme.js
 * University brand colors: Red, White, and Grey.
 * All UI components import from here so the style is consistent.
 */
export const COLORS = {
  primary: '#B22222',       // University Red
  secondary: '#F5F5F5',     // Light grey background
  text: '#333333',
  white: '#FFFFFF',
  overlay: 'rgba(255, 255, 255, 0.95)',
  success: '#2E7D32',
  grey: '#999999',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },

  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.grey,
    textTransform: 'uppercase',
  },

  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },

  heroCard: {
    backgroundColor: COLORS.white,
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heroText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 15,
  },
  heroSubtext: {
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },

  searchCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.grey,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  divider: {
    height: 20,
  },

  mainButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  backLink: {
    textAlign: 'center',
    marginTop: 20,
    color: COLORS.grey,
    fontWeight: '600',
  },

  navHUD: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
  },
  instructionCard: {
    backgroundColor: COLORS.overlay,
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 8,
    borderLeftColor: COLORS.primary,
    elevation: 10,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  distanceText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 5,
  },

  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  
  toggleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
});