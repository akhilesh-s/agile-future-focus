interface MetaData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export const updateMetaTags = (data: MetaData) => {
  // Update title
  if (data.title) {
    document.title = data.title;
    updateMetaProperty('og:title', data.title);
    updateMetaProperty('twitter:title', data.title);
  }

  // Update description
  if (data.description) {
    updateMetaProperty('description', data.description);
    updateMetaProperty('og:description', data.description);
    updateMetaProperty('twitter:description', data.description);
  }

  // Update image
  if (data.image) {
    updateMetaProperty('og:image', data.image);
    updateMetaProperty('twitter:image', data.image);
  }

  // Update URL
  if (data.url) {
    updateMetaProperty('og:url', data.url);
  }
};

const updateMetaProperty = (property: string, content: string) => {
  // For name-based meta tags
  let element = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
  
  // For property-based meta tags (og:, twitter:)
  if (!element) {
    element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  }

  if (element) {
    element.content = content;
  } else {
    // Create new meta tag if it doesn't exist
    const meta = document.createElement('meta');
    if (property.startsWith('og:') || property.startsWith('twitter:')) {
      meta.setAttribute('property', property);
    } else {
      meta.setAttribute('name', property);
    }
    meta.content = content;
    document.head.appendChild(meta);
  }
};

export const getRetroMetaData = (retroName: string, retroId: string): MetaData => {
  return {
    title: `${retroName} - Agile Retrospective Tool`,
    description: `Join the "${retroName}" retrospective session. Collaborate with your team to reflect, learn, and improve together using our interactive retrospective tool.`,
    url: `${window.location.origin}/retro/${retroId}`,
    image: `${window.location.origin}/favicon.ico`
  };
};

export const getRetroResultsMetaData = (retroName: string, retroId: string): MetaData => {
  return {
    title: `${retroName} - Results Summary`,
    description: `View the complete results and insights from the "${retroName}" retrospective session. See team feedback, action items, and key takeaways.`,
    url: `${window.location.origin}/retro/${retroId}/results`,
    image: `${window.location.origin}/favicon.ico`
  };
}; 