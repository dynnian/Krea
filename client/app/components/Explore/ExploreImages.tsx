import React from "react";

type ExploreImagesProps = {
  selectedTag?: string | null;
  selectedArtist?: string | null;
};

const ART_IMAGES = [
  "https://64.media.tumblr.com/c022bc0620e545c6c7e6f9e70608fc78/cc7da65a337ab8f3-64/s540x810/b03c7c28697d943ef5b09f9de1de7d40b7b8b645.jpg",
  "https://www.fightersgeneration.com/characters3/sol-hd.jpg",
  "https://c10.patreonusercontent.com/4/patreon-media/p/campaign/3847911/e6d51604975e41f3b1694320e9aa2f8a/eyJxIjoxMDAsIndlYnAiOjB9/4.jpeg?token-hash=etAZlxhge5yBFSd-PelVxgg2HI4gDLubJd_EP3fPsdI%3D&token-time=1773964800",
  "https://cdn.cara.app/production/posts/2fb2f165-1539-421c-9ed3-3d2486d874c4/exphrasis-T5MMHdZnefrch6dJTznsH-geoffrey-ernault-linkhouse-painting-finallq.jpg",
  "https://pbs.twimg.com/media/GVZwD5HbQAAmMYG.jpg",
  "https://cdn.cara.app/production/posts/dc559eb3-22d6-4367-9a81-26ca82cb8822/anatofinnstark-hBeJtWJy5Kcy4PHRNdK6H-twitter.jpg",
  "https://pbs.twimg.com/media/Gj9aZDga8AAwy_J.jpg",
  "https://preview.redd.it/hi-here-is-a-series-of-illustration-i-did-showing-each-v0-j810rddc60ma1.jpg?width=640&crop=smart&auto=webp&s=93644c992ecb773e3697f2c25a1193dc8da95cf0",
  "https://cdn.cara.app/production/posts/7afd1769-146e-42e5-b6cc-4cb1f16adfeb/gabinguede-rTO2DA020FUxJHq0YhSmK-GabinGuede_CDC_Harajuku_Final-protected.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4D7w0iUg64wYkldvcXFxDC6FxDnHoFk_mGg&s",
  "https://cdn.cara.app/production/posts/c4954c8f-de91-4e63-b676-9788992bc704/rouz-YIehju7dRXKdCLUxEPwzZ-1_3.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOIQeX9T9UpAjoWyFq4eIy0Ijjm7I2OHv4tg&s",
  "https://cdn.cara.app/production/posts/21873dca-c5f5-4e86-9365-2de565b91c1b/3FD0F02E-3854-49B3-92E9-0E67105BB233.jpg-s8QW07-kf3g_sSHiadNcc-3FD0F02E-3854-49B3-92E9-0E67105BB233.jpg",
  "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/bcdbac5b-cdc4-410e-8020-c863a7210f66/desn50s-7a231a68-b6d6-4995-a9bd-8abc812ff31f.jpg/v1/fill/w_1600,h_900,q_75,strp/iyenss_by_neytirix_desn50s-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6Ii9mL2JjZGJhYzViLWNkYzQtNDEwZS04MDIwLWM4NjNhNzIxMGY2Ni9kZXNuNTBzLTdhMjMxYTY4LWI2ZDYtNDk5NS1hOWJkLThhYmM4MTJmZjMxZi5qcGciLCJ3aWR0aCI6Ijw9MTYwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.TgnpC4omHSOFYWk5YLwxvVK5zRM0fkbS-H2APwcJ1rU",
  "https://cdn.cara.app/production/posts/3dd1a104-92fd-4dc6-9e47-6f421ccd1ee4/exphrasis-R807-XWw2CI8M16i8Hgd7-geoffrey-ernault-thecollapsedminesofuriyvna-nightshade-intensity-low-v1.jpg",
  "https://pbs.twimg.com/media/GVZwD5HbQAAmMYG.jpg",
  "https://i.redd.it/g28j012cskgb1.jpg",
  "https://i.redd.it/zquumfgobnn41.jpg",
  "https://pbs.twimg.com/media/GTCXo_LbgAAL54w.jpg",
  "https://i.ytimg.com/vi/cywUzYCae6w/maxresdefault.jpg",
  "https://i.redd.it/hb4ef9d6x8o91.png",
  "https://www.fangamer.com/cdn/shop/products/product_OW_ash_and_ember_poster_photo2.png?crop=center&height=1200&v=1743203623&width=1800",
  "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/bcdbac5b-cdc4-410e-8020-c863a7210f66/dfljvk0-6df24fff-c079-4b3c-af02-67dd0efb1794.jpg/v1/fill/w_1192,h_670,q_70,strp/heading_home_by_neytirix_dfljvk0-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6Ii9mL2JjZGJhYzViLWNkYzQtNDEwZS04MDIwLWM4NjNhNzIxMGY2Ni9kZmxqdmswLTZkZjI0ZmZmLWMwNzktNGIzYy1hZjAyLTY3ZGQwZWZiMTc5NC5qcGciLCJ3aWR0aCI6Ijw9MTYwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.jl-snsWgUXwWyRyVEPBFDwYLSG0UOvhQzbZXLK7YID8",
  "https://cdn.cara.app/production/posts/895c5186-246b-4f44-b6e5-9a328e2b9437/anatofinnstark-C-c2Y1CQOkc7I3r12Uv_3-anato-finnstark-anato-finnstark-anato-finnstark-web-petit-1.jpg",
  "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/bcdbac5b-cdc4-410e-8020-c863a7210f66/dfhoanh-90b65e72-551a-4f15-acd9-ac7f265922f7.jpg/v1/fit/w_828,h_1472,q_70,strp/can_you_not_read___by_neytirix_dfhoanh-414w-2x.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9Mjg0NSIsInBhdGgiOiIvZi9iY2RiYWM1Yi1jZGM0LTQxMGUtODAyMC1jODYzYTcyMTBmNjYvZGZob2FuaC05MGI2NWU3Mi01NTFhLTRmMTUtYWNkOS1hYzdmMjY1OTIyZjcuanBnIiwid2lkdGgiOiI8PTE2MDAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.3rL3MHyGUHTws3DdEHu4nqMmIHRrgi53vS9mGNLLUAc",
  "https://cdn.cara.app/production/posts/48a2af3b-85a0-4145-956e-aea4d753af0e/F9CC42FC-416F-4B13-AB06-DB3F3935B55D.jpg-C0ggd0XSrlL1kfi3HyGGe-F9CC42FC-416F-4B13-AB06-DB3F3935B55D.jpg",
  "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/bcdbac5b-cdc4-410e-8020-c863a7210f66/desjf2j-94cd470e-918b-4221-9efe-48ff7aa8bd04.jpg/v1/fill/w_1281,h_624,q_70,strp/flee_puny_mortals_fleeeee__by_neytirix_desjf2j-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9Nzc5IiwicGF0aCI6Ii9mL2JjZGJhYzViLWNkYzQtNDEwZS04MDIwLWM4NjNhNzIxMGY2Ni9kZXNqZjJqLTk0Y2Q0NzBlLTkxOGItNDIyMS05ZWZlLTQ4ZmY3YWE4YmQwNC5qcGciLCJ3aWR0aCI6Ijw9MTYwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.Um3ubCbBJCO6JDYQwYAiscbfuFu4ef6tjQxSTfyjAWo",
  "https://cdn.cara.app/production/posts/679e55bf-1df0-48fa-b4e8-162bc9471a6a/rouz-vLK77KN7O6eqbW0v9v_C3-1.jpg",
  "https://www.pcgamesn.com/wp-content/sites/pcgamesn/2025/11/outer-wilds-lowest-price-fanatical-birthday-bash.jpg",
  "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/bcdbac5b-cdc4-410e-8020-c863a7210f66/dej67tg-9c0bfeaa-2211-4838-af11-ef44bc0f9379.jpg/v1/fill/w_1048,h_763,q_70,strp/theo_the_butcher_by_neytirix_dej67tg-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTE2NSIsInBhdGgiOiIvZi9iY2RiYWM1Yi1jZGM0LTQxMGUtODAyMC1jODYzYTcyMTBmNjYvZGVqNjd0Zy05YzBiZmVhYS0yMjExLTQ4MzgtYWYxMS1lZjQ0YmMwZjkzNzkuanBnIiwid2lkdGgiOiI8PTE2MDAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.W_XZGnoDTt9bvDKsh_Xxi8nzpuQjRXR91n0xNadp0X4",
  "https://cdn.cara.app/production/posts/0d681d1d-81d5-4a2d-a3c9-b3bb070153eb/gabinguede-dIFvj8KcJ-qV1I6Qp7Vu--Elden-Ring_Thumbnail.png",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80",

];

export default function ExploreImages({
  selectedTag,
  selectedArtist,
}: ExploreImagesProps) {
  return (
    <div className="pt-[22px] pb-[1px]">
      {(selectedTag || selectedArtist) && (
        <div className="max-w-[1200px] mx-auto mb-4 text-[#1B1C1E] text-sm px-2 md:px-4">
          {selectedTag && <span>Tag: {selectedTag}</span>}
          {selectedTag && selectedArtist && <span> · </span>}
          {selectedArtist && <span>Artist: {selectedArtist}</span>}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-8 w-full gap-[1px]">
        {ART_IMAGES.map((src, index) => (
          <div
            key={index}
            className="aspect-square overflow-hidden bg-[#ddd]"
          >
        <img
        src={src}
        alt={`art-${index}`}
        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition duration-200"
        />
          </div>
        ))}
      </div>
    </div>
  );
}