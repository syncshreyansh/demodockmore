import React, { useState } from 'react';
import {
  Upload,
  ArrowRight,
  Cloud,
  ChevronDown,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import FolderCard from '../components/ui/FolderCard';
import PillButton from '../components/ui/PillButton';
import SearchInput from '../components/ui/SearchInput';
import ProviderIcon from '../components/ui/ProviderIcon';
import { useFiles } from '../hooks/useFiles';
import { useAccounts } from '../hooks/useAccounts';

function StorageTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const isFreeSpace = data.provider === 'free' || data.name === 'Free Space';

  return (
    <div className="bg-white/95 backdrop-blur-md border border-black/10 shadow-[0_4px_24px_rgba(0,0,0,0.14)] rounded-2xl p-3 min-w-[210px] text-ink select-none pointer-events-none transition-all duration-150 z-50">
      {/* Header: Icon/Dot + Provider Name + Amount badge */}
      <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-2 mb-2">
        <div className="flex items-center gap-2">
          {!isFreeSpace && data.provider ? (
            <ProviderIcon provider={data.provider} size="xs" />
          ) : (
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: data.color }}
            />
          )}
          <span className="font-bold text-xs text-ink leading-none">
            {data.name}
          </span>
        </div>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white leading-none"
          style={{ backgroundColor: isFreeSpace ? '#8A8785' : data.color }}
        >
          {data.used} GB
        </span>
      </div>

      {/* Account Info */}
      {isFreeSpace ? (
        <div className="text-[11px] text-muted leading-tight">
          Available unallocated storage
        </div>
      ) : data.accounts && data.accounts.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {data.accounts.map((acc, idx) => (
            <div key={idx} className="flex flex-col text-[11px] leading-tight">
              <div className="flex items-center justify-between text-ink font-medium">
                <span className="truncate max-w-[125px]">{acc.name || 'Account'}</span>
                <span className="text-muted font-normal text-[10px]">{acc.used}</span>
              </div>
              <span className="text-muted text-[10px] truncate">{acc.email}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-[11px] text-muted">
          {data.used} GB used
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { folders, stats, loading } = useFiles();
  const { user } = useAccounts();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Folders');

  const chartData = stats?.storageByProvider || [
    {
      name: 'Google Drive',
      provider: 'google-drive',
      used: 17.5,
      color: '#00AC47',
      accounts: [
        { name: 'Personal Drive', email: 'mailshreyanshhere@gmail.com', used: '7.5 GB' },
        { name: 'Tech & Work', email: 'shreyanshgottech@gmail.com', used: '10 GB' },
      ],
    },
    {
      name: 'MEGA',
      provider: 'mega',
      used: 15,
      color: '#D9272E',
      accounts: [
        { name: 'Archives & Media', email: 'mailshreyanshhere@gmail.com', used: '15 GB' },
      ],
    },
    {
      name: 'OneDrive',
      provider: 'onedrive',
      used: 2.5,
      color: '#0078D4',
      accounts: [
        { name: 'Microsoft Work', email: 'reachbitsandgears@outlook.com', used: '2.5 GB' },
      ],
    },
    {
      name: 'Free Space',
      provider: 'free',
      used: 10,
      color: '#D9D8D6',
      accounts: [],
    },
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleUploadClick = () => {
    navigate('/files');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Split-background header */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="bg-white px-0 py-0 lg:flex-1 flex flex-col justify-center min-h-[78px]">
          <h1 className="font-serif italic text-[38px] leading-none md:text-[46px] text-[#303030] font-bold tracking-[-0.038em]">
            Good morning, {user?.name?.split(' ')[0] || 'Shreyansh'}
          </h1>
          <p className="font-sans text-sm md:text-[19px] leading-tight text-[#8a8a8a] mt-1">
            Here's what's happening with your clouds today.
          </p>
        </div>

        <div className="bg-white px-0 py-0 flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-[13px] lg:w-[657px] mt-[13px]">
          <PillButton
            variant="solid"
            size="md"
            rounded="full"
            icon={Upload}
            onClick={handleUploadClick}
            className="shrink-0 h-[48px] w-[135px] lg:w-[135px] px-6 rounded-figma font-semibold shadow-[0_0_13.1px_3px_rgba(0,0,0,0.25)] hover:shadow active:scale-[0.98] transition-all"
          >
            Upload
          </PillButton>
          <SearchInput
            value={searchQuery}
            onChange={handleSearch}
            onClear={() => setSearchQuery('')}
            placeholder="Search across all your clouds..."
            className="flex-1 min-w-0"
            inputClassName="h-[48px] bg-[#252525]/10 hover:bg-[#252525]/15 focus:bg-white text-[15px]"
          />
        </div>
      </div>

      {/* Asymmetric stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-7">
        <div className="md:col-span-2 lg:col-span-6 bg-sidebar rounded-figma p-6 flex flex-col justify-between min-h-[190px] shadow-[0_0_4px_rgba(0,0,0,0.25)]">
          <div>
            <h4 className="text-[30px] md:text-[37px] leading-none font-semibold tracking-[-0.048em] text-[#303030] font-sans">
              Total Storage
            </h4>
            <p className="text-sm md:text-[19px] text-[#8a8a8a] font-normal mt-1">
              {stats?.connectedAccountsCount || 5} Accounts Connected
            </p>
          </div>

          <div className="flex items-end justify-between gap-4 mt-6">
            <div>
              <div className="font-sans font-semibold text-[30px] md:text-[37px] leading-none text-[#303030] tracking-[-0.048em]">
                {stats?.totalUsedGB || 35} GB
              </div>
              <p className="text-xs text-[#303030] font-semibold mt-1">
                of {stats?.totalCapacityGB || 45} GB used.
              </p>
            </div>

            <div className="w-24 h-24 shrink-0 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={<StorageTooltip />}
                    allowEscapeViewBox={{ x: true, y: true }}
                    wrapperStyle={{ outline: 'none', zIndex: 100 }}
                  />
                  <Pie
                    data={chartData}
                    innerRadius={26}
                    outerRadius={38}
                    paddingAngle={2}
                    dataKey="used"
                    stroke="none"
                    cursor="pointer"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="transition-opacity duration-150 hover:opacity-85 focus:outline-none"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <StatCard
          variant="sidebar"
          className="md:col-span-1 lg:col-span-3 min-h-[190px]"
          value={`${stats?.totalFilesCount || 1987} files`}
          valueSubtitle="across all your clouds."
          icon={Cloud}
          action={
            <PillButton
              to="/files"
              variant="solid"
              size="sm"
              rounded="full"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto font-medium"
            >
              View all files
            </PillButton>
          }
        />

        <StatCard
          variant="sidebar"
          className="md:col-span-1 lg:col-span-3 min-h-[190px]"
          value={`${stats?.recentTransfersCount || 5} Transfers`}
          valueBadge={
            <div className="flex items-center gap-1 bg-ink text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
              <span>1M</span>
              <ChevronDown className="w-3 h-3 text-white/70" />
            </div>
          }
          valueSubtitle="happened last month."
          action={
            <PillButton
              to="/transfers"
              variant="solid"
              size="sm"
              rounded="full"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto font-medium"
            >
              View all transfers
            </PillButton>
          }
        />
      </div>

      {/* Recent folders */}
      <section className="bg-sidebar rounded-figma p-7 flex flex-col gap-5 min-h-[560px]">
        <div className="flex flex-col gap-1">
          <h2 className="font-sans font-semibold text-[30px] leading-none text-[#303030] tracking-[-0.048em]">Recent</h2>
          <div className="inline-flex">
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink transition-colors duration-150"
            >
              <span>{filterType}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full py-8 text-center text-sm text-muted">
              Loading recent folders...
            </div>
          ) : (
            folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onClick={() => navigate('/files')}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
