"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
      const channel = subscribeToRealtime();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUser(data.user);
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  const addBookmark = async () => {
    if (!title || !url) return;

    console.log("Adding bookmark...", { title, url, user_id: user.id });

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        title,
        url,
        user_id: user.id,
      })
      .select();

    if (error) {
      console.error("Error adding bookmark:", error);
      alert("Failed to add bookmark");
      return;
    }

    console.log("Bookmark added successfully:", data);

    if (data && data.length > 0) {
      setBookmarks((prev) => {
        // Prevent duplicate if logic matches
        const newBookmark = data[0];
        if (prev.some((b) => b.id === newBookmark.id)) return prev;
        return [newBookmark, ...prev];
      });
    } else {
      // Fallback if data is not returned (e.g. RLS policy weirdness)
      console.warn("No data returned from insert, fetching all bookmarks...");
      fetchBookmarks();
    }

    setTitle("");
    setUrl("");
  };

  const deleteBookmark = async (id) => {
    // Optimistic update
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) {
        console.error("Error deleting bookmark:", error);
        // Revert if error (optional, but good practice)
        fetchBookmarks(); 
    }
  };

  const subscribeToRealtime = () => {
    console.log("Subscribing to realtime...");
    const channel = supabase
      .channel("bookmarks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        (payload) => {
          console.log("Realtime event received:", payload);
          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => {
              if (prev.some((b) => b.id === payload.new.id)) {
                return prev;
              }
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === "DELETE") {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return channel;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              🔖
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">
                Smart Bookmarks
              </h1>
              <p className="text-white/70 text-sm">Welcome, {user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="group flex items-center gap-2 bg-red-500/80 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-red-500/30 font-medium backdrop-blur-sm"
          >
            <span>Logout</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </header>

        {/* Add Bookmark Section */}
        <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/30 mb-10">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">✨</span> Add New Bookmark
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="Title (e.g., My Portfolio)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="URL (https://...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              onClick={addBookmark}
              disabled={!title || !url}
              className="bg-white text-indigo-600 font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              Add
            </button>
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="group bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white p-2 rounded-lg transition-colors"
                  title="Delete bookmark"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-500/30 p-3 rounded-xl">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h3 className="text-white font-semibold text-lg truncate mb-1">
                      {bookmark.title}
                    </h3>
                    <p className="text-indigo-200 text-sm truncate opacity-80 group-hover:opacity-100 transition-opacity">
                      {bookmark.url}
                    </p>
                  </div>
                </div>
              </a>
            </div>
          ))}

          {bookmarks.length === 0 && (
            <div className="col-span-full py-16 text-center text-white/50 bg-white/5 rounded-2xl border border-white/5 border-dashed">
              <p className="text-lg">No bookmarks found.</p>
              <p className="text-sm">Add your first bookmark above! 🚀</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
