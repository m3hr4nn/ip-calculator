# IP Subnet Calculator

A lightweight, static **IP subnet calculator** designed as a personal utility tool for network engineers and compute teams. Built with vanilla **HTML, CSS, and JavaScript** for easy deployment on local infrastructure (GitLab, GitHub Pages, or standalone servers).

**Live Demo:** https://m3hr4nn.github.io/ip-calculator/

---

## Purpose

This project was created as a small, self-contained tool to provide **quick access to IP subnet calculations** for compute and network teams. It's designed to be deployed on local systems (like internal GitLab instances) for:

- **Faster access** to subnet calculations without external dependencies
- **Better network understanding** for infrastructure teams
- **Quick verification** of IP addressing schemes and CIDR notations
- **Educational reference** with interactive CIDR/subnet mask tables

No backend required—just static files that can be hosted anywhere.

---

## Features

### Calculator
- **Flexible IP Input**: Accepts both standard format (`192.168.1.1`) and combined CIDR notation (`192.168.1.1/24`)
- **Dual CIDR Format Support**: Input as numeric CIDR (`24`) or subnet mask (`255.255.255.0`)
- **Comprehensive Results**: Network address, broadcast address, subnet mask, wildcard mask, usable hosts, and host range
- **Animated Display**: Professional bullet-point results with smooth fade-in animations
- **Keyboard Support**: Press Enter to calculate from any input field

### Interactive Reference Table
- **Complete CIDR Reference**: All CIDR notations from `/0` to `/32`
- **Wildcard Masks**: Includes wildcard mask column for ACL configurations
- **Clickable Rows**: Click any table row to auto-fill the calculator with that CIDR value
- **Visual Feedback**: Hover effects and click animations for better UX
- **Formatted Numbers**: Locale-aware number formatting (e.g., `1,000` instead of `1000`)

### Design
- **Modern Dark Theme**: Navy blue and gold color scheme
- **Professional Styling**: Segoe UI font with gradient backgrounds
- **Responsive Layout**: Works on desktop and mobile devices
- **Smooth Animations**: Subtle, professional animations throughout

---

## How It Works

### Architecture
This is a single-page application (SPA) with no dependencies:
- **[index.html](index.html)**: Contains all HTML structure and inline JavaScript for subnet calculations
- **[style.css](style.css)**: Navy blue and gold theme styling
- **No build process**: Pure vanilla JavaScript—just open in a browser

### Core Functionality
1. **IP/CIDR Parsing**: Validates and parses IP addresses with optional CIDR notation
2. **Binary Conversion**: Converts IP addresses and subnet masks to binary for bitwise operations
3. **Network Calculations**:
   - Network address via bitwise AND with subnet mask
   - Broadcast address via bitwise OR with inverse mask
   - Host range calculation with special handling for `/31` and `/32` subnets
4. **Interactive Table**: Auto-populates calculator fields when clicking reference table rows

### Special Cases Handled
- `/31` subnets: Point-to-point links (2 usable hosts, no network/broadcast)
- `/32` subnets: Single host routes (1 usable host)
- Standard subnets: Total hosts minus 2 (excludes network and broadcast addresses)

---

## Deployment

### GitHub Pages (Current Live Demo)
1. Fork or clone this repository
2. Go to **Settings > Pages**
3. Select **main branch** as source
4. Your site will be available at: `https://<username>.github.io/ip-calculator/`

### Local GitLab Instance (Recommended for Internal Teams)
Perfect for deploying on your organization's internal GitLab:

1. Create a new GitLab project
2. Push this repository to your GitLab instance
3. Ensure `.gitlab-ci.yml` is present:
   ```yaml
   pages:
     stage: deploy
     script:
       - mkdir .public
       - cp index.html style.css .public/
     artifacts:
       paths:
         - .public
     only:
       - main
   ```
4. GitLab Pages will automatically deploy on push to `main`
5. Access via: `https://<gitlab-instance>/<username>/ip-calculator/`

### Standalone Server
No web server required—just open `index.html` in any browser:
```bash
# Direct file access
open index.html

# Or use a simple HTTP server (optional)
python3 -m http.server 8000
```

For production deployment on a web server:
```bash
# Copy files to web root
sudo cp index.html style.css /var/www/html/ip-calculator/
```

---

## Usage Examples

### Basic Calculation
1. Enter IP: `192.168.1.100`
2. Enter CIDR: `24` (or `255.255.255.0`)
3. Click **Calculate** or press **Enter**

### Combined Format
1. Enter IP: `10.0.0.5/16`
2. Leave CIDR field empty (will use `/16` from IP input)
3. Click **Calculate** or press **Enter**

### Quick Reference
1. Scroll to the **CIDR to Subnet Mask Table**
2. Click any row (e.g., `/26`)
3. Table auto-fills the CIDR field
4. Enter your IP address and calculate

---

## Development

### Project Structure
```
ip-calculator/
├── index.html       # Main HTML + JavaScript
├── style.css        # Navy blue & gold theme
├── .gitlab-ci.yml   # GitLab Pages deployment
├── CLAUDE.md        # Development documentation
├── README.md        # This file
└── LICENSE          # License information
```

### Local Testing
```bash
# No build process required—just open the file
open index.html

# Or use Python's built-in server
python3 -m http.server 8000
# Visit: http://localhost:8000
```

### Version Management
This project follows **Semantic Versioning 2.0.0**. Since there's no `package.json`, versions are managed via git tags:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (Chromium) 88+
- Firefox 85+
- Safari 14+
- Opera 74+

Requires JavaScript enabled.

---

## Use Cases

This tool is particularly useful for:
- **Network Engineers**: Quick subnet calculations and CIDR reference
- **System Administrators**: Verifying IP addressing schemes
- **DevOps Teams**: Planning network segmentation for infrastructure
- **Students/Learners**: Understanding subnetting with visual feedback
- **Compute Teams**: Fast access to network calculations without external tools

---

## Contributing

This is a personal utility project, but contributions are welcome! Feel free to:
- Report bugs via GitHub Issues
- Submit pull requests with improvements
- Fork and customize for your own needs

---

## License

See [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Built with vanilla web technologies—no frameworks, no dependencies, no bloat. Just a simple, effective tool for everyday network calculations.
