export const fetchYouTubeVideoTitle = async (
  videoId: string,
  apiKey: string,
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`,
    );
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.title;
    } else {
      console.error(`Could not retrieve title for video ID: ${videoId}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching YouTube video title:", error);
    return null;
  }
};
