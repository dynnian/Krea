namespace Krea.Application.Features.DirectMessages.Mappings {
    using AutoMapper;
    using Domain.Entities;
    using Dto;

    public class DirectMessageProfile : Profile {
        public DirectMessageProfile() {
            CreateMap<Message, DirectMessageDto>()
                .ForMember(dest => dest.SenderId, opt => opt.MapFrom(src => src.User.Id))
                .ForMember(dest => dest.SenderUsername, opt => opt.Ignore())
                .ForMember(dest => dest.SenderDisplayName, opt => opt.MapFrom(src => src.User.DisplayName))
                .ForMember(dest => dest.ReceiverId, opt => opt.Ignore())
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.TextContent))
                .ForMember(dest => dest.SentAt, opt => opt.MapFrom(src => src.SentAt))
                .ForMember(dest => dest.IsRead, opt => opt.Ignore());

            CreateMap<Message, LastMessagePreviewDto>()
                .ForMember(dest => dest.SenderId, opt => opt.MapFrom(src => src.User.Id))
                .ForMember(dest => dest.SenderDisplayName, opt => opt.MapFrom(src => src.User.DisplayName))
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.TextContent))
                .ForMember(dest => dest.SentAt, opt => opt.MapFrom(src => src.SentAt))
                .ForMember(dest => dest.IsRead, opt => opt.Ignore());
        }
    }
}