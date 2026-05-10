import { StreamEvent } from "../hooks/useAgentStream";

interface Props {
  events: StreamEvent[];
}

interface Competitor {
  name: string;
  founded?: number;
  funding?: string;
}

interface NiaData {
  tiktok_videos?: Array<{ title: string; views: string }>;
  competitors?: Competitor[];
  market_size_estimate?: string;
  failed_companies?: Array<{ name: string; reason: string }>;
  negative_signals?: string[];
}

export default function ResearchPanel({ events }: Props) {
  const niaEvents = events.filter((e) => e.type === "nia_result");

  if (niaEvents.length === 0) return null;

  // Merge all nia data
  const allData: NiaData = {};
  for (const event of niaEvents) {
    const content = event.content as NiaData;
    if (content?.tiktok_videos)
      allData.tiktok_videos = [
        ...(allData.tiktok_videos || []),
        ...content.tiktok_videos,
      ];
    if (content?.competitors)
      allData.competitors = [
        ...(allData.competitors || []),
        ...content.competitors,
      ];
    if (content?.market_size_estimate)
      allData.market_size_estimate = content.market_size_estimate;
    if (content?.failed_companies)
      allData.failed_companies = [
        ...(allData.failed_companies || []),
        ...content.failed_companies,
      ];
    if (content?.negative_signals)
      allData.negative_signals = [
        ...(allData.negative_signals || []),
        ...content.negative_signals,
      ];
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
        Market Research Data
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Market Size */}
        {allData.market_size_estimate && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="text-xs text-gray-500 uppercase mb-1">
              Estimated TAM
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {allData.market_size_estimate}
            </div>
          </div>
        )}

        {/* TikTok Signal */}
        {allData.tiktok_videos && allData.tiktok_videos.length > 0 && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="text-xs text-gray-500 uppercase mb-1">
              TikTok Signals
            </div>
            <div className="text-2xl font-bold text-pink-400">
              {allData.tiktok_videos.length} viral videos
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {allData.tiktok_videos[0]?.title}
            </div>
          </div>
        )}

        {/* Competitors */}
        {allData.competitors && allData.competitors.length > 0 && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 md:col-span-2">
            <div className="text-xs text-gray-500 uppercase mb-3">
              Top Competitors
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {allData.competitors.map((c) => (
                <div
                  key={c.name}
                  className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                >
                  <div className="font-medium text-white">{c.name}</div>
                  {c.founded && (
                    <div className="text-xs text-gray-400">
                      Founded {c.founded}
                    </div>
                  )}
                  {c.funding && (
                    <div className="text-xs text-emerald-400">
                      {c.funding} raised
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Signals */}
        {allData.negative_signals && allData.negative_signals.length > 0 && (
          <div className="bg-gray-900 rounded-lg border border-rose-900/30 p-4 md:col-span-2">
            <div className="text-xs text-rose-400 uppercase mb-2">
              Risk Signals
            </div>
            <ul className="space-y-1">
              {allData.negative_signals.map((signal, idx) => (
                <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  {signal}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Failed Companies */}
        {allData.failed_companies && allData.failed_companies.length > 0 && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 md:col-span-2">
            <div className="text-xs text-gray-500 uppercase mb-2">
              Failed Predecessors
            </div>
            <div className="space-y-2">
              {allData.failed_companies.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-sm">
                  <span className="text-rose-400 font-medium">{c.name}</span>
                  <span className="text-gray-600">—</span>
                  <span className="text-gray-400">{c.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
