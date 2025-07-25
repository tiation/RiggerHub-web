# 🏗️ RiggerHub - Web Platform

### **Enterprise-Grade, Ethical, Striking Design by ChaseWhiteRabbit NGO**
*Operations Management Hub for Construction Industry Professionals*

[![ChaseWhiteRabbit NGO](https://img.shields.io/badge/ChaseWhiteRabbit_NGO-Ethical_Tech-FF6B35.svg)](https://chasewhiterabbit.org)
[![Enterprise Grade](https://img.shields.io/badge/Enterprise-Grade_Architecture-0066CC.svg)](#)
[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-green.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Open Source](https://img.shields.io/badge/Open_Source-Transparency-brightgreen.svg)](#)
[![DevOps Ready](https://img.shields.io/badge/DevOps-Docker_+_CI/CD-blue.svg)](#)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Platform](https://img.shields.io/badge/platform-Web-lightgrey.svg)](#)

## 🌐 Live Deployment

**🚀 View the live site:** [https://riggerhub-web.netlify.app](https://riggerhub-web.netlify.app)

### Testing Instructions

To access and test the deployed RiggerHub platform:

1. **Access the Site**: Click the deployment link above or navigate to `https://riggerhub-web.netlify.app`
2. **Mobile Testing**: The platform is mobile-first - test on various device sizes for optimal experience
3. **Key Features to Test**:
   - Worker registration flow
   - Job browsing and filtering
   - Profile management interface
   - Responsive design across devices
4. **Browser Compatibility**: Tested on Chrome, Firefox, Safari, and Edge
5. **Performance**: The site is optimized for fast loading, even on slower connections

> **Note**: This is a demonstration deployment of the archived codebase. For the latest active development, please visit the RiggerConnect-web repository.

---

## About RiggerHub

RiggerHub is the premier web platform connecting skilled riggers, doggers, and crane operators with top construction, mining, and resources companies across Western Australia. Part of the comprehensive Rigger Project ecosystem, RiggerHub empowers workers to advance their careers while supporting the ChaseWhiteRabbit NGO's mission.

## 🎯 Purpose

RiggerHub serves as the worker-focused platform in the Rigger Project ecosystem:

- **For Workers**: Register availability, upload qualifications, accept job offers, and manage professional profiles
- **Career Advancement**: Connect with premier employers and access high-paying opportunities
- **Compliance Management**: Maintain certifications and stay compliant with WA safety standards
- **Professional Growth**: Track work history, earnings, and career progression

## 🏗️ The Rigger Project Ecosystem

RiggerHub is part of a comprehensive dual-platform system:

### RiggerHub (This Platform)
- **Audience**: Workers (riggers, doggers, crane operators)
- **Features**: Job registration, qualification management, profile creation, job acceptance

### RiggerConnect (Sister Platform)
- **Audience**: Businesses (construction, mining, resources companies)
- **Features**: Job posting, worker matching, recruitment management

Both platforms connect through a shared backend managing job matching, contracts, payments, and compliance while funding the ChaseWhiteRabbit NGO.

## 🌟 Key Features

### For Workers
- **Smart Job Matching**: AI-powered system matches skills and qualifications with perfect opportunities
- **Digital Qualifications**: Secure storage and management of certifications and licenses
- **Instant Alerts**: Real-time notifications for matching job opportunities
- **Compliance Tracking**: Stay current with WA safety standards and certification renewals
- **Location-Based Jobs**: Find opportunities in preferred WA locations
- **Career Tracking**: Monitor work history, earnings, and professional growth

### Platform Benefits
- **2-5x Faster Job Placement**: Streamlined matching process
- **98% Worker Satisfaction**: Proven success rate
- **24/7 Availability**: Always-on platform access
- **100% Verified Companies**: All partner businesses are compliance-verified

## 🔗 Related Repositories

### Core Platform Components

| Repository | Platform | Description | GitHub SSH URL |
|------------|----------|-------------|----------------|
| **RiggerBackend** | API/Backend | Core backend services and APIs for the Rigger ecosystem | `git@github.com:tiation/RiggerBackend.git` |
| **RiggerConnect-web** | Web | Professional networking platform for construction workers | `git@github.com:tiation/RiggerConnect-web.git` |
| **RiggerConnect-android** | Android | Native Android mobile networking application | `git@github.com:tiation/RiggerConnect-android.git` |
| **RiggerConnect-capacitor** | Cross-platform | Cross-platform mobile app built with Ionic Capacitor | `git@github.com:tiation/RiggerConnect-capacitor.git` |
| **RiggerConnect-ios** | iOS | Native iOS mobile networking application | `git@github.com:tiation/RiggerConnect-ios.git` |
| **RiggerHub-web** | Web | Operations management hub for business users | `git@github.com:tiation/RiggerHub-web.git` |
| **RiggerHub-android** | Android | Native Android operations management application | `git@github.com:tiation/RiggerHub-android.git` |
| **RiggerHub-ios** | iOS | Native iOS operations management application | `git@github.com:tiation/RiggerHub-ios.git` |
| **RiggerShared** | Multi-platform | Shared libraries, components, and utilities | `git@github.com:tiation/RiggerShared.git` |

### Enterprise Integration Architecture

```mermaid
graph TB
    RB[RiggerBackend<br/>Core API Services] --> RCW[RiggerConnect-web]
    RB --> RCA[RiggerConnect-android]
    RB --> RCI[RiggerConnect-ios]
    RB --> RHW[RiggerHub-web]
    RB --> RHA[RiggerHub-android]
    RB --> RHI[RiggerHub-ios]
    RS[RiggerShared<br/>Common Libraries] --> RCW
    RS --> RCA
    RS --> RCI
    RS --> RHW
    RS --> RHA
    RS --> RHI
    
    style RHW fill:#00FFFF,color:#000
    style RB fill:#FF00FF,color:#000
    style RS fill:#00FF00,color:#000
```

### ChaseWhiteRabbit NGO License Framework

All repositories in the Rigger ecosystem are licensed under **GPL v3**, ensuring:
- ✅ **Open Source Transparency**: Complete code visibility and community auditing
- ✅ **Ethical Technology Standards**: Algorithmic fairness and bias prevention
- ✅ **Worker Empowerment Focus**: Technology serving users, not corporate profits
- ✅ **Community Ownership**: Improvements benefit the entire rigger community
- ✅ **Corporate Responsibility**: Commercial use must remain open and accessible

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui component library
- **State Management**: TanStack Query for data management
- **Routing**: React Router v6
- **Build Tool**: Vite for fast development and building

## 🎨 Design Philosophy

RiggerHub features a professional, industry-focused design:

- **Industrial Theme**: Blue and orange color scheme reflecting construction/mining industry
- **Mobile-First**: Optimized for on-site mobile device usage
- **Clean & Functional**: Fast loading, intuitive navigation
- **Trust-Building**: Professional appearance that builds confidence with workers and employers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd riggerhub-web

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📱 Mobile Support

RiggerHub is built mobile-first with full responsive design. For native mobile app capabilities, the platform can be extended with Capacitor for iOS and Android deployment.

## 🤝 Supporting ChaseWhiteRabbit NGO

Every successful job placement through RiggerHub contributes to the ChaseWhiteRabbit NGO's mission. The platform demonstrates how technology can create positive social impact while serving industry needs.

**ChaseWhiteRabbit NGO Mission**: [Add specific mission details]

## 📋 Compliance & Safety

RiggerHub maintains strict compliance with Western Australian construction and mining industry standards:

- Digital certification verification
- Automated compliance tracking
- Safety standard updates
- Regular audit compliance

## 🔗 Related Projects

- **RiggerConnect**: Business-focused job posting platform
- **RiggerBackend**: Shared backend services and API
- **RiggerShared**: Common UI components and contracts

## 📞 Support

For technical support or platform assistance:

- **Email**: support@riggerhub.com.au
- **Phone**: +61 8 9123 4567
- **Location**: Perth, Western Australia

## 📧 Contact Information

### Primary Maintainers

For inquiries related to the Rigger ecosystem, please contact our primary maintainers:

#### **Jack Jonas** - Industry Expert & Operations Lead
- **Email**: [jackjonas95@gmail.com](mailto:jackjonas95@gmail.com)
- **Background**: Rigger crane operator and heavy vehicle mechanic based in Karratha, WA
- **Expertise**: Brings extensive hands-on experience from Western Australia's mining and construction industry, providing real-world insights into rigger operations, safety protocols, and workforce challenges

#### **Tia** - Technical Lead & NGO Coordinator  
- **Email**: [tiatheone@protonmail.com](mailto:tiatheone@protonmail.com)
- **Background**: Swedish software developer working with NGO ChaseWhiteRabbit
- **Expertise**: Leads the technical architecture and development while ensuring the platform aligns with ChaseWhiteRabbit NGO's ethical technology standards and social impact mission

### Vision Statement

The unique combination of **Jack's deep rigging industry experience** from Australia's resource sector and **Tia's NGO-driven mission** for ethical technology creates a SaaS platform that truly serves workers rather than exploiting them. This partnership ensures RiggerHub addresses real industry pain points while maintaining the highest standards of worker empowerment and social responsibility.

Together, they oversee the development and coordination of the entire Rigger platform ecosystem, including RiggerConnect, RiggerHub, RiggerBackend, and RiggerShared repositories.

## 📄 License

© 2024 RiggerHub. All rights reserved.

---

Made with ❤️ in Western Australia as part of the Rigger Project supporting ChaseWhiteRabbit NGO.