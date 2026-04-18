namespace Krea.Application.Features.User {
    using Abstractions.Identity;
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Domain.Validators;
    using static Common.RoleHelper;

    public sealed class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, UserDto> {
        private readonly IUserRepository _userRepository;
        private readonly IMediaRepository _mediaRepository;
        private readonly IIdentityService _identityService;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateUserProfileCommandHandler(
            IUserRepository userRepository,
            IMediaRepository mediaRepository,
            IIdentityService identityService,
            IUnitOfWork unitOfWork) {
            _userRepository = userRepository;
            _mediaRepository = mediaRepository;
            _identityService = identityService;
            _unitOfWork = unitOfWork;
        }

        public async Task<UserDto> Handle(
            UpdateUserProfileCommand request,
            CancellationToken cancellationToken) {
            User? domainUser = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (domainUser is null)
                throw new KeyNotFoundException("User not found.");

            ValidateRequest(request);

            if (request.DisplayNameIsSet) {
                domainUser.UpdateDisplayName(request.DisplayName!.Trim());
            }

            if (request.BiographyIsSet) {
                domainUser.UpdateBiography((request.Biography ?? string.Empty).Trim());
            }

            if (request.LanguageCodeIsSet || request.TimeZoneIdIsSet) {
                string nextLanguageCode = request.LanguageCodeIsSet
                    ? request.LanguageCode!.Trim()
                    : domainUser.LanguageCode;

                string nextTimeZoneId = request.TimeZoneIdIsSet
                    ? request.TimeZoneId!.Trim()
                    : domainUser.TimeZoneId;

                domainUser.UpdateLocalization(nextLanguageCode, nextTimeZoneId);
            }

            if (request.ProfilePictureIdIsSet) {
                if (request.ProfilePictureId.HasValue) {
                    Media? profilePicture =
                        await _mediaRepository.GetByIdAsync(request.ProfilePictureId.Value, cancellationToken);
                    if (profilePicture is null)
                        throw new KeyNotFoundException("Profile picture not found.");

                    domainUser.UpdateProfilePicture(profilePicture);
                }
                else {
                    domainUser.ClearProfilePicture();
                }
            }

            if (request.BannerPictureIdIsSet) {
                if (request.BannerPictureId.HasValue) {
                    Media? bannerPicture =
                        await _mediaRepository.GetByIdAsync(request.BannerPictureId.Value, cancellationToken);
                    if (bannerPicture is null)
                        throw new KeyNotFoundException("Banner picture not found.");

                    domainUser.UpdateBannerPicture(bannerPicture);
                }
                else {
                    domainUser.ClearBannerPicture();
                }
            }

            await _userRepository.UpdateAsync(domainUser, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            UserIdentity? identityUser = await _identityService.FindByIdAsync(domainUser.Id);
            if (identityUser is null)
                throw new KeyNotFoundException("Identity user not found.");

            return new UserDto(
                domainUser.Id,
                identityUser.UserName,
                identityUser.Email,
                domainUser.DisplayName,
                domainUser.Biography,
                domainUser.LanguageCode,
                domainUser.TimeZoneId,
                GetRoleInt(identityUser.Roles)
            );
        }

        private static void ValidateRequest(UpdateUserProfileCommand request) {
            bool hasAnyChange = request.DisplayNameIsSet
                                || request.BiographyIsSet
                                || request.LanguageCodeIsSet
                                || request.TimeZoneIdIsSet
                                || request.ProfilePictureIdIsSet
                                || request.BannerPictureIdIsSet;

            if (!hasAnyChange)
                throw new ArgumentException("Request must include at least one updatable property.");

            if (request.DisplayNameIsSet) {
                if (string.IsNullOrWhiteSpace(request.DisplayName))
                    throw new ArgumentException("DisplayName cannot be empty when provided.");

                if (request.DisplayName.Trim().Length > 32)
                    throw new ArgumentException("DisplayName cannot exceed 32 characters.");
            }

            if (request.BiographyIsSet && (request.Biography ?? string.Empty).Trim().Length > 256)
                throw new ArgumentException("Biography cannot exceed 256 characters.");

            if (request.LanguageCodeIsSet) {
                if (string.IsNullOrWhiteSpace(request.LanguageCode))
                    throw new ArgumentException("LanguageCode cannot be empty when provided.");

                var languageCodeValidator = new LanguageCodeAttribute();
                if (!languageCodeValidator.IsValid(request.LanguageCode.Trim()))
                    throw new ArgumentException(languageCodeValidator.ErrorMessage);
            }

            if (request.TimeZoneIdIsSet) {
                if (string.IsNullOrWhiteSpace(request.TimeZoneId))
                    throw new ArgumentException("TimeZoneId cannot be empty when provided.");

                var timeZoneValidator = new TimeZoneAttribute();
                if (!timeZoneValidator.IsValid(request.TimeZoneId.Trim()))
                    throw new ArgumentException(timeZoneValidator.ErrorMessage);
            }
        }
    }
}