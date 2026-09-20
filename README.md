# Job Portal Frontend

A modern Next.js frontend application for a job portal platform. This application connects to a Job Portal API and provides features for both candidates and recruiters.

## Features

- **Authentication**: Login and registration for candidates and recruiters
- **Job Listings**: Browse and search through available job postings
- **Job Details**: View detailed information about job opportunities
- **Job Applications**: Apply to jobs with cover letters and resume links
- **Recruiter Dashboard**: Create, edit, and manage job postings
- **Company Management**: Create and manage company profiles
- **Application Tracking**: Track submitted job applications (for candidates)

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Context API** - State management for authentication

## Prerequisites

Before running this application, ensure you have:

- Node.js (v18 or higher)
- npm, yarn, or pnpm
- The Job Portal API running on `http://localhost:5000/api` (or configure your API URL in `.env.local`)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

   You can copy the example file:
   ```bash
   cp .env.example .env.local
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── companies/          # Company creation page (recruiters)
│   ├── dashboard/          # Recruiter dashboard
│   ├── jobs/               # Job listings and details
│   ├── login/              # Login page
│   ├── my-applications/    # Candidate's applications
│   ├── register/           # Registration page
│   ├── layout.tsx          # Root layout with AuthProvider
│   └── page.tsx            # Home page
├── components/
│   └── Navbar.tsx          # Navigation component
├── contexts/
│   └── AuthContext.tsx     # Authentication context
└── lib/
    └── api.ts              # API client
```

## API Integration

This frontend connects to the Job Portal API with the following endpoints:

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (recruiters)
- `PUT /jobs/:id` - Update job (recruiters)
- `DELETE /api/jobs/:id` - Delete job (recruiters)

### Applications
- `POST /api/jobs/:id/apply` - Apply for job
- `GET /api/application/my` - Get my applications

### Companies
- `POST /companies` - Create company (recruiters)

### Users
- `GET /users` - List all users
- `PATCH /api/admin/users/:id/role` - Update user role (admin)

## User Roles

- **CANDIDATE**: Can browse jobs, view details, and apply to positions
- **RECRUITER**: Can create company profiles, post jobs, and manage applications
- **ADMIN**: Can manage user roles

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **API Methods**: Add new methods to `src/lib/api.ts`
2. **Pages**: Create new pages in `src/app/` following the App Router structure
3. **Components**: Add reusable components in `src/components/`
4. **Context**: Extend `src/contexts/AuthContext.tsx` for additional state management

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Build the application:
```bash
npm run build
```

The output will be in the `.next` folder, which can be deployed to any platform that supports Node.js.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL for the API | `http://localhost:5000/api` |

## Troubleshooting

### API Connection Issues
- Ensure the backend API is running
- Check that `NEXT_PUBLIC_API_URL` is correctly set in `.env.local`
- Verify CORS settings on the backend API

### Authentication Issues
- Clear browser localStorage if experiencing auth problems
- Check that tokens are being stored correctly
- Verify API endpoints are accessible

## License

This project is part of the DevOps batch training materials.
