const FALLBACK_SLIDES = [
  {
    tag: 'Limited Time Bonanza',
    title: 'Earn Real Cashback. <span>Withdraw to Bank.</span>',
    desc: 'Shop at Amazon, Ajio, Flipkart & 500+ stores via Cyvanta and get paid real cash on top of store discounts!',
    cta: 'Browse Top Offers',
    storeName: 'Myntra Fashion',
    cashbackRate: '12%',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png',
    isActive: true
  },
  {
    tag: 'Electronics Mega Deal',
    title: 'Up to <span>8% Cashback</span> on Gadgets & Tech',
    desc: 'Upgrade your phone, laptop, or home devices. Get guaranteed cashback rates and active merchant coupons.',
    cta: 'Shop Electronics Now',
    storeName: 'Flipkart Electronics',
    cashbackRate: '8.5%',
    logo: 'https://www.google.com/s2/favicons?sz=256&domain=flipkart.com',
    isActive: true
  },
  {
    tag: 'Referral Bonanza',
    title: 'Refer Friends. <span>Get 10% Forever!</span>',
    desc: 'Share your personal referral link with friends. Earn a flat 10% of the cashback they earn, for life!',
    cta: 'Invite Friends Now',
    storeName: 'Ajio Deals',
    cashbackRate: '15%',
    logo: 'https://www.google.com/s2/favicons?sz=256&domain=ajio.com',
    isActive: true
  },
];

async function seedBanners() {
  for (const slide of FALLBACK_SLIDES) {
    try {
      const response = await fetch('http://localhost:8080/api/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slide),
      });
      if (response.ok) {
        console.log(`Successfully added banner: ${slide.tag}`);
      } else {
        console.error(`Failed to add banner: ${slide.tag}`);
      }
    } catch (error) {
      console.error(`Error adding banner: ${slide.tag}`, error);
    }
  }
  console.log("Seeding complete!");
}

seedBanners();
