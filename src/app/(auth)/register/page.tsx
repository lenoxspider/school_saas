'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { School, Building, User, Mail, Lock, Phone, MapPin, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolCode: '',
    country: 'Ghana',
    phone: '',
    address: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/app');
      router.refresh();
    } catch (err: unknown) {
      setError(String(err).replace('Error: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold mx-auto shadow-lg shadow-blue-600/30">
            <School className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Onboard Your School</h2>
          <p className="text-xs text-slate-400">
            Set up your multi-tenant academic database in 60 seconds (30-day free trial).
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="border-b border-slate-800 pb-3 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                1. School Institutional Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">School Name</label>
                <input
                  type="text"
                  name="schoolName"
                  required
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder="e.g. Ridge Church School"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">School Code / Acronym</label>
                <input
                  type="text"
                  name="schoolCode"
                  required
                  value={formData.schoolCode}
                  onChange={handleChange}
                  placeholder="e.g. RCS"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Ghana">Ghana (GHS)</option>
                  <option value="Nigeria">Nigeria (NGN)</option>
                  <option value="United States">International (USD)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">Contact Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+233 24 000 0000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">School Address / Location</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Accra, Greater Accra, Ghana"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="border-b border-slate-800 pb-3 mb-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                2. Principal Administrator Account
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">First Name</label>
                <input
                  type="text"
                  name="adminFirstName"
                  required
                  value={formData.adminFirstName}
                  onChange={handleChange}
                  placeholder="Kwesi"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">Last Name</label>
                <input
                  type="text"
                  name="adminLastName"
                  required
                  value={formData.adminLastName}
                  onChange={handleChange}
                  placeholder="Appiah"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Official Admin Email</label>
              <input
                type="email"
                name="adminEmail"
                required
                value={formData.adminEmail}
                onChange={handleChange}
                placeholder="headmaster@school.edu.gh"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Password (min. 8 characters)</label>
              <input
                type="password"
                name="adminPassword"
                required
                minLength={8}
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Setting Up School Database...' : 'Complete Registration & Launch Workspace'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="text-blue-400 hover:underline font-semibold">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
