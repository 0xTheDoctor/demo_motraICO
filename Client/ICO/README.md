# MOTRA ICO Frontend

A clean, modern React frontend for the MOTRA token ICO (Initial Coin Offering) built with Thirdweb integration.

## 🚀 Features

- **USDC Payment Integration**: Purchase MOTRA tokens using USDC
- **Fiat Payment Support**: Buy USDC with credit cards via Thirdweb Buy Widget
- **Real-time ICO Stats**: Live updates on token price, availability, and progress
- **Wallet Connection**: Seamless MetaMask and other wallet integration
- **Error Handling**: User-friendly error messages and validation
- **Responsive Design**: Mobile-first approach with clean UI

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ICOPurchase.jsx   # Main purchase interface
│   ├── ICOPurchase.css   # Purchase component styles
│   ├── ICOStats.jsx      # ICO statistics display
│   ├── ICOStats.css      # Stats component styles
│   ├── WalletConnection.jsx # Wallet connection component
│   ├── WalletConnection.css # Wallet styles
│   ├── ErrorBoundary.jsx # Error handling component
│   └── ErrorBoundary.css # Error boundary styles
├── config/
│   └── thirdweb.js       # Thirdweb configuration
├── utils/
│   └── web3.js          # Web3 utility functions
├── App.jsx              # Main application component
├── App.css              # Application styles
├── index.css            # Global styles and CSS variables
└── main.jsx             # Application entry point
```

## 🎨 Design System

### CSS Variables
The project uses a comprehensive design system with CSS custom properties:

```css
/* Colors */
--blue-50 to --blue-700    /* Primary blue shades */
--gray-50 to --gray-900    /* Neutral gray shades */
--yellow-50 to --yellow-800 /* Warning/Info colors */
--red-50 to --red-600      /* Error colors */
--orange-600               /* Accent color */
```

### Component Architecture
- **BEM Methodology**: All component classes follow BEM naming convention
- **Modular CSS**: Each component has its own CSS file
- **Responsive Design**: Mobile-first approach with breakpoints
- **Accessibility**: Proper ARIA labels and semantic HTML

## 🔧 Key Components

### ICOPurchase
The main purchase interface with:
- Token information display
- Payment method selection (USDC/Fiat)
- Amount input with real-time cost calculation
- Error handling with modal popups
- Thirdweb Buy Widget integration

### ICOStats
Real-time ICO statistics including:
- Progress bar with percentage
- Token price display
- Available tokens count
- Total tokens sold
- Presale status indicators

### WalletConnection
Seamless wallet integration with:
- Connect button styling
- Multiple wallet support
- Connection status display

## 🛠️ Technical Stack

- **React 18**: Modern React with hooks
- **Thirdweb**: Web3 integration and wallet connection
- **Vite**: Fast build tool and development server
- **CSS3**: Modern styling with custom properties
- **Base Network**: Target blockchain network

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file with:
   ```
   VITE_THIRDWEB_CLIENT_ID=your_client_id_here
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: > 768px

## 🎯 Key Features

### Payment Flow
1. **USDC Payment**: Direct USDC token purchase
2. **Fiat Payment**: Buy USDC first, then purchase tokens
3. **Error Handling**: Comprehensive error messages
4. **Validation**: Input validation and balance checks

### User Experience
- **Loading States**: Spinners and progress indicators
- **Error Modals**: User-friendly error messages
- **Real-time Updates**: Live data from blockchain
- **Mobile Optimized**: Touch-friendly interface

## 🔒 Security Features

- **Input Validation**: Client-side validation
- **Error Boundaries**: Graceful error handling
- **Secure Transactions**: Thirdweb integration
- **Balance Checks**: Pre-transaction validation

## 🎨 Customization

### Styling
- Modify CSS variables in `index.css` for theme changes
- Component-specific styles in individual CSS files
- Responsive breakpoints in component CSS files

### Configuration
- Update contract address in `config/thirdweb.js`
- Modify network settings for different chains
- Customize error messages in components

## 📄 License

This project is part of the MOTRA Web3 fitness platform.

## 🤝 Contributing

1. Follow the existing code structure
2. Use BEM methodology for CSS classes
3. Maintain responsive design principles
4. Test on multiple devices and browsers
5. Follow React best practices

---

**Built with ❤️ for the MOTRA community**
