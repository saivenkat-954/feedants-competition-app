import React, { useEffect, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getCompetition,
  getRegistrationStatus,
  registerForCompetition,
  getSubmissionStatus,
  submitCompetitionEntry,
} from "../services/api";
import { getCompetitionLifecycle } from "../utils/competitionStatus";
import { getCountdown } from "../utils/countdown";

type Competition = {
  _id: string;
  title: string;
  category: string;
  tags: string[];
  prizePool: number;
  entryFee: number;
  maxParticipants: number;
  registeredParticipants: number;
  registrationStart: string;
  registrationEnd: string;
  submissionStart: string;
  submissionEnd: string;
  resultDate: string;
  judge: {
    name: string;
    profession: string;
    experience: string;
    image?: string;
    introVideo?: string;
  };
  rewards: {
    position: number;
    title: string;
    amount: number;
  }[];
  previousWinners: {
    name: string;
    position: number;
    image?: string;
  }[];
  description: string;
  judgingParameters: string[];
  rules: string[];
  status: string;
};

const competitionId =
  process.env.EXPO_PUBLIC_COMPETITION_ID;

const DEMO_USER_ID = "user_002";

export default function CompetitionScreen() {
  const [competition, setCompetition] =
    useState<Competition | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] =
    useState(false);
  const [registering, setRegistering] =
    useState(false);
    const [isSubmitted, setIsSubmitted] =
  useState(false);

const [submitting, setSubmitting] =
  useState(false);
  const [, setNow] = useState(new Date());

  const loadCompetition = async () => {
    try {
      setLoading(true);
      setError("");

      if (!competitionId) {
        throw new Error(
          "Competition ID is missing"
        );
      }

      const response =
        await getCompetition(competitionId);

      setCompetition(response.data);

      const registrationResponse =
        await getRegistrationStatus(
          competitionId,
          DEMO_USER_ID
        );

      setIsRegistered(
        registrationResponse.registered
      );
      const submissionResponse =
  await getSubmissionStatus(
    competitionId,
    DEMO_USER_ID
  );

setIsSubmitted(
  submissionResponse.submitted
);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load competition."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!competitionId || !competition) {
      return;
    }

    if (isRegistered || registering) {
      return;
    }

    try {
      setRegistering(true);
      setError("");

      const response =
        await registerForCompetition(
          competitionId,
          DEMO_USER_ID
        );

      if (response.success) {
        setIsRegistered(true);

        setCompetition((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            registeredParticipants:
              current.registeredParticipants + 1,
          };
        });
      }
    } catch (err: any) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleSubmit = async () => {
  if (!competitionId || !competition) {
    return;
  }

  const lifecycle =
    getCompetitionLifecycle(competition);

  if (lifecycle !== "SUBMISSION_OPEN") {
    setError(
      "Submission is not currently open."
    );
    return;
  }

  if (!isRegistered) {
    setError(
      "Please register before submitting."
    );
    return;
  }

  if (isSubmitted || submitting) {
    return;
  }

  try {
    setSubmitting(true);
    setError("");

    const result =
      await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

    if (result.canceled) {
      return;
    }

    const file = result.assets[0];

    const response =
      await submitCompetitionEntry(
        competitionId,
        DEMO_USER_ID,
        file.name,
        file.uri
      );

    if (response.success) {
      setIsSubmitted(true);
    }
  } catch (err: any) {
    console.error(
      "Submission error:",
      err
    );

    setError(
      err?.response?.data?.message ||
        "Submission failed"
    );
  } finally {
    setSubmitting(false);
  }
};

  useEffect(() => {
    loadCompetition();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#078b94"
        />
        <Text style={styles.loadingText}>
          Loading competition...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !competition) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>
          Something went wrong
        </Text>

        <Text style={styles.errorText}>
          {error ||
            "Competition not found"}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadCompetition}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const remainingSpots = Math.max(
    competition.maxParticipants -
      competition.registeredParticipants,
    0
  );

  const bookedPercentage = Math.min(
    (competition.registeredParticipants /
      competition.maxParticipants) *
      100,
    100
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.backContainer}>
            <Text style={styles.backIcon}>
              ‹
            </Text>

            <Text style={styles.backText}>
              Go back
            </Text>
          </View>

          <View style={styles.languageContainer}>
            <Text
              style={styles.activeLanguage}
            >
              ENG
            </Text>

            <Text
              style={styles.inactiveLanguage}
            >
              हिंदी
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {competition.title}
            </Text>

            {isRegistered ? (
              <View
                style={styles.registeredBadge}
              >
                <Text
                  style={styles.registeredIcon}
                >
                  ✓
                </Text>

                <Text
                  style={styles.registeredText}
                >
                  Registered
                </Text>
              </View>
            ) : (
              <Pressable
                style={[
                  styles.registerButton,
                  registering &&
                    styles.registerButtonDisabled,
                ]}
                onPress={handleRegister}
                disabled={registering}
              >
                <Text
                  style={
                    styles.registerButtonText
                  }
                >
                  {registering
                    ? "Registering..."
                    : "Register"}
                </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.tagRow}>
            {competition.tags.map((tag) => (
              <View
                key={tag}
                style={styles.tag}
              >
                <Text style={styles.tagText}>
                  {tag}
                </Text>
              </View>
            ))}

            <View
              style={
                styles.certificateContainer
              }
            >
              <Text
                style={styles.certificateIcon}
              >
                🏆
              </Text>

              <Text
                style={styles.certificate}
              >
                Winners get certificate
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>
                Prize Pool
              </Text>

              <Text style={styles.statValue}>
                ₹{" "}
                {competition.prizePool.toLocaleString(
                  "en-IN"
                )}
              </Text>
            </View>

            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>
                Entry Fee
              </Text>

              <Text
                style={
                  styles.statValueSmall
                }
              >
                ₹ {competition.entryFee}
              </Text>
            </View>

            <View
              style={styles.spotsContainer}
            >
              <Text style={styles.spotsText}>
                👥 Only {remainingSpots} spots
                left
              </Text>

              <View
                style={
                  styles.progressBackground
                }
              >
                <View
                  style={[
                    styles.progress,
                    {
                      width: `${bookedPercentage}%`,
                    },
                  ]}
                />
              </View>

              <Text
                style={styles.bookingText}
              >
                {competition.registeredParticipants}{" "}
                / {competition.maxParticipants}{" "}
                Booked
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.judgeRow}>
            <View style={styles.judgeAvatar}>
              <Text
                style={styles.avatarText}
              >
                {getInitials(
                  competition.judge.name
                )}
              </Text>
            </View>

            <View style={styles.judgeInfo}>
              <Text style={styles.judgeLabel}>
                Judge
              </Text>

              <Text style={styles.judgeName}>
                {competition.judge.name}
              </Text>

              <Text
                style={
                  styles.judgeProfession
                }
              >
                {competition.judge.profession}
              </Text>

              <Text
                style={
                  styles.judgeExperience
                }
              >
                {competition.judge.experience}
              </Text>
            </View>

            <View style={styles.videoButton}>
              <View
                style={styles.playCircle}
              >
                <Text
                  style={styles.playIcon}
                >
                  ▶
                </Text>
              </View>

              <Text style={styles.videoText}>
                Intro Video
              </Text>
            </View>
          </View>
        </View>

        <LifecycleCard
          competition={competition}
        />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Important Dates
          </Text>

          <View style={styles.datesGrid}>
            <DateItem
              icon="▣"
              label="Register Before"
              value={formatDate(
                competition.registrationEnd
              )}
            />

            <DateItem
              icon="✈"
              label="Submission Starts"
              value={formatDate(
                competition.submissionStart
              )}
            />

            <DateItem
              icon="⇧"
              label="Submission Ends"
              value={formatDate(
                competition.submissionEnd
              )}
            />

            <DateItem
              icon="🏆"
              label="Result Date"
              value={formatDate(
                competition.resultDate
              )}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Previous Winners
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
          >
            {competition.previousWinners.map(
              (winner, index) => (
                <View
                  key={`${winner.name}-${index}`}
                  style={styles.winnerCard}
                >
                  <View
                    style={
                      styles.winnerAvatar
                    }
                  >
                    <Text
                      style={
                        styles.winnerInitial
                      }
                    >
                      {winner.name.charAt(0)}
                    </Text>
                  </View>

                  <Text
                    style={styles.winnerName}
                    numberOfLines={1}
                  >
                    {winner.name}
                  </Text>

                  <Text
                    style={
                      styles.winnerPosition
                    }
                  >
                    {getPositionText(
                      winner.position
                    )}
                  </Text>
                </View>
              )
            )}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
          >
            <View style={styles.tabRow}>
              <View
                style={
                  styles.activeTabContainer
                }
              >
                <Text
                  style={styles.activeTab}
                >
                  About Competition
                </Text>
              </View>

              <View
                style={styles.tabContainer}
              >
                <Text style={styles.tab}>
                  Judging Parameters
                </Text>
              </View>

              <View
                style={styles.tabContainer}
              >
                <Text style={styles.tab}>
                  Rules & Eligibility
                </Text>
              </View>
            </View>
          </ScrollView>

          <Text style={styles.description}>
            {competition.description}
          </Text>

          <Text style={styles.viewMore}>
            View more⌄
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.rewardsHeader}>
            <Text
              style={styles.sectionTitle}
            >
              Rewards
            </Text>

            <Text
              style={styles.allPositions}
            >
              (All Positions)
            </Text>
          </View>

          {competition.rewards.map(
            (reward) => (
              <View
                key={reward.position}
                style={styles.rewardRow}
              >
                <Text style={styles.medal}>
                  {getRewardIcon(
                    reward.position
                  )}
                </Text>

                <Text
                  style={styles.rewardTitle}
                >
                  {reward.title}
                </Text>

                <Text
                  style={styles.rewardAmount}
                >
                  ₹ {reward.amount}
                </Text>
              </View>
            )
          )}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.infoIcon}>
            ⓘ
          </Text>

          <Text
            style={styles.disclaimerText}
          >
            Only contributions from paid
            participants will be considered
            for judging.
          </Text>
        </View>

        <View style={styles.infoCardsRow}>
          <View style={styles.infoCard}>
            <View style={styles.infoPlay}>
              <Text
                style={styles.infoPlayIcon}
              >
                ▶
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                How will you receive
              </Text>

              <Text style={styles.infoTitle}>
                prize money?
              </Text>

              <Text
                style={styles.infoSubtitle}
              >
                Watch video to know more
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.policyIcon}>
              <Text
                style={styles.policyIconText}
              >
                ✓
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Refund policy
              </Text>

              <Text
                style={styles.paymentText}
              >
                ✓ Secure payments powered by
                Razorpay
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.referralCard}>
          <View style={styles.referralIcon}>
            <Text style={styles.megaphone}>
              📣
            </Text>
          </View>

          <View
            style={styles.referralContent}
          >
            <Text
              style={styles.referralTitle}
            >
              Refer & Earn more discount
            </Text>

            <View
              style={styles.referralInputRow}
            >
              <View
                style={styles.referralInput}
              >
                <Text
                  style={
                    styles.referralInputText
                  }
                  numberOfLines={1}
                >
                  https://feedants.com/r/referral123
                </Text>
              </View>

              <Pressable
                style={styles.copyButton}
              >
                <Text style={styles.copyText}>
                  Copy Link
                </Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            style={styles.referButton}
          >
            <Text
              style={
                styles.referButtonText
              }
            >
              Refer Now
            </Text>

            <Text
              style={styles.referSubtext}
            >
              You earn ₹10 for every signup
            </Text>
          </Pressable>
        </View>

        <View style={styles.reviewsCard}>
          <View style={styles.reviewIcon}>
            <Text>💬</Text>
          </View>

          <View style={styles.reviewContent}>
            <Text style={styles.reviewTitle}>
              Hear From Our Users
            </Text>

            <Text
              style={styles.reviewSubtitle}
            >
              See what participants say about
              Feedants
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </View>

        <View style={styles.adCard}>
          <Text style={styles.adIcon}>
            📢
          </Text>

          <Text style={styles.adText}>
            Ad Here
          </Text>
        </View>

        <Pressable
  style={[
    styles.submitButton,
    getCompetitionLifecycle(
      competition
    ) !== "SUBMISSION_OPEN" &&
      styles.submitButtonDisabled,
    submitting &&
      styles.submitButtonDisabled,
  ]}
  onPress={handleSubmit}
  disabled={
    getCompetitionLifecycle(
      competition
    ) !== "SUBMISSION_OPEN" ||
    submitting ||
    isSubmitted
  }
>
  <Text style={styles.submitTitle}>
    {isSubmitted
      ? "✓ Submission Submitted"
      : submitting
      ? "Submitting..."
      : "Upload Submission"}
  </Text>

  <Text style={styles.submitSubtitle}>
    {isSubmitted
      ? "Your entry has been received"
      : getSubmissionButtonText(
          competition
        )}
  </Text>
</Pressable>

        <View
          style={styles.bottomNavigation}
        >
          <BottomNavItem
            icon="⌂"
            label="Home"
          />

          <BottomNavItem
            icon="⌕"
            label="Explore"
          />

          <View style={styles.addButton}>
            <Text style={styles.addIcon}>
              +
            </Text>
          </View>

          <BottomNavItem
            icon="🏆"
            label="Competitions"
            active
          />

          <BottomNavItem
            icon="●"
            label="Profile"
          />
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

function LifecycleCard({
  competition,
}: {
  competition: Competition;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const lifecycle =
    getCompetitionLifecycle(
      competition
    );

  let title = "";
  let value = "";

  if (lifecycle === "UPCOMING") {
    title = "Registration opens in";
    value = formatCountdown(
      getCountdown(
        competition.registrationStart
      )
    );
  } else if (
    lifecycle === "REGISTRATION_OPEN"
  ) {
    title = "Registration closes in";
    value = formatCountdown(
      getCountdown(
        competition.registrationEnd
      )
    );
  } else if (
    lifecycle === "REGISTRATION_CLOSED"
  ) {
    title = "Registration closed";
    value = "Submission coming soon";
  } else if (
    lifecycle === "SUBMISSION_OPEN"
  ) {
    title = "Submission closes in";
    value = formatCountdown(
      getCountdown(
        competition.submissionEnd
      )
    );
  } else if (
    lifecycle === "SUBMISSION_CLOSED"
  ) {
    title = "Submission closed";
    value = "Results coming soon";
  } else if (lifecycle === "RESULTS") {
    title = "Competition completed";
    value = "Results available";
  }

  return (
    <View style={styles.countdownCard}>
      <Text style={styles.hourglass}>
        {lifecycle === "RESULTS"
          ? "🏆"
          : "⏳"}
      </Text>

      <Text
        style={styles.countdownLabel}
      >
        {title}
      </Text>

      <Text
        style={styles.countdownValue}
      >
        {value}
      </Text>

      {lifecycle !== "RESULTS" ? (
        <Text style={styles.hurry}>
          ⏱ Hurry up!
        </Text>
      ) : null}
    </View>
  );
}

function DateItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.dateItem}>
      <Text style={styles.dateIcon}>
        {icon}
      </Text>

      <View style={styles.dateContent}>
        <Text style={styles.dateLabel}>
          {label}
        </Text>

        <Text style={styles.dateValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function BottomNavItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <View style={styles.bottomNavItem}>
      <Text
        style={[
          styles.bottomNavIcon,
          active
            ? styles.bottomNavActive
            : null,
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.bottomNavLabel,
          active
            ? styles.bottomNavActive
            : null,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getPositionText(position: number) {
  if (position === 1) {
    return "1st Winner";
  }

  if (position === 2) {
    return "2nd Winner";
  }

  if (position === 3) {
    return "3rd Winner";
  }

  return `${position}th Winner`;
}

function getRewardIcon(position: number) {
  if (position === 1) {
    return "🏆";
  }

  if (position === 2) {
    return "🥈";
  }

  if (position === 3) {
    return "🥉";
  }

  return "☆";
}

function formatCountdown(countdown: {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) {
  if (countdown.expired) {
    return "Closed";
  }

  return `${String(
    countdown.days
  ).padStart(2, "0")}d : ${String(
    countdown.hours
  ).padStart(2, "0")}h : ${String(
    countdown.minutes
  ).padStart(2, "0")}m : ${String(
    countdown.seconds
  ).padStart(2, "0")}s`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function getSubmissionButtonText(
  competition: Competition
) {
  const lifecycle =
    getCompetitionLifecycle(competition);

  if (lifecycle === "UPCOMING") {
    return "Registration opens soon";
  }

  if (lifecycle === "REGISTRATION_OPEN") {
    return `Submission opens ${formatDate(
      competition.submissionStart
    )}`;
  }

  if (lifecycle === "REGISTRATION_CLOSED") {
    return `Submission opens ${formatDate(
      competition.submissionStart
    )}`;
  }

  if (lifecycle === "SUBMISSION_OPEN") {
    return "Upload your entry";
  }

  if (lifecycle === "SUBMISSION_CLOSED") {
    return "Submission closed";
  }

  return "Competition completed";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fbfc",
  },

  content: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fbfc",
    padding: 20,
  },

  loadingText: {
    marginTop: 12,
    color: "#526b72",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#172e52",
  },

  errorText: {
    marginTop: 8,
    color: "#777",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#078b94",
  },

  retryText: {
    color: "#fff",
    fontWeight: "700",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  backContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 34,
    color: "#173052",
    lineHeight: 34,
  },

  backText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#173052",
    marginLeft: 5,
  },

  languageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#edf5f6",
    borderRadius: 22,
    padding: 3,
  },

  activeLanguage: {
    backgroundColor: "#078b94",
    color: "#fff",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    fontWeight: "800",
    fontSize: 12,
  },

  inactiveLanguage: {
    color: "#586b73",
    paddingHorizontal: 11,
    paddingVertical: 7,
    fontSize: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 17,
    padding: 16,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "#e7eef0",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#172e52",
  },

  registerButton: {
    backgroundColor: "#078b94",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9,
  },

  registerButtonDisabled: {
    opacity: 0.65,
  },

  registerButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  registeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#edf8f8",
    borderWidth: 1,
    borderColor: "#bde6e8",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },

  registeredIcon: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#078b94",
    color: "#fff",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    marginRight: 5,
  },

  registeredText: {
    color: "#078b94",
    fontWeight: "700",
    fontSize: 11,
  },

  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 10,
  },

  tag: {
    backgroundColor: "#f1f4f8",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },

  tagText: {
    color: "#243b5b",
    fontWeight: "600",
    fontSize: 12,
  },

  certificateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  certificateIcon: {
    fontSize: 13,
    marginRight: 4,
  },

  certificate: {
    color: "#078b94",
    fontWeight: "700",
    fontSize: 12,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 21,
    gap: 15,
  },

  statBlock: {
    minWidth: 120,
  },

  statLabel: {
    color: "#788b92",
    fontSize: 13,
  },

  statValue: {
    color: "#078b94",
    fontSize: 29,
    fontWeight: "800",
    marginTop: 2,
  },

  statValueSmall: {
    color: "#172e52",
    fontSize: 27,
    fontWeight: "800",
    marginTop: 2,
  },

  spotsContainer: {
    flex: 1,
    maxWidth: 280,
  },

  spotsText: {
    color: "#078b94",
    fontWeight: "800",
    fontSize: 13,
  },

  progressBackground: {
    height: 7,
    borderRadius: 10,
    backgroundColor: "#dceff1",
    marginTop: 9,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    backgroundColor: "#078b94",
    borderRadius: 10,
  },

  bookingText: {
    color: "#75878d",
    fontSize: 11,
    marginTop: 5,
  },

  judgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  judgeAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#d8f0f0",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#078b94",
  },

  judgeInfo: {
    flex: 1,
    marginLeft: 14,
  },

  judgeLabel: {
    color: "#73868e",
    fontSize: 12,
  },

  judgeName: {
    color: "#172e52",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },

  judgeProfession: {
    color: "#657a82",
    fontSize: 12,
    marginTop: 3,
  },

  judgeExperience: {
    color: "#657a82",
    fontSize: 12,
    marginTop: 3,
  },

  videoButton: {
    alignItems: "center",
    marginLeft: 10,
  },

  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e2f4f5",
    alignItems: "center",
    justifyContent: "center",
  },

  playIcon: {
    color: "#078b94",
    fontSize: 16,
    marginLeft: 2,
  },

  videoText: {
    color: "#536b73",
    fontSize: 11,
    marginTop: 5,
  },

  countdownCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9f7f7",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 11,
    gap: 9,
  },

  hourglass: {
    fontSize: 17,
  },

  countdownLabel: {
    color: "#172e52",
    fontWeight: "800",
    fontSize: 13,
  },

  countdownValue: {
    color: "#078b94",
    fontSize: 18,
    fontWeight: "800",
    marginLeft: "auto",
  },

  hurry: {
    color: "#078b94",
    fontWeight: "700",
    fontSize: 12,
  },

  sectionTitle: {
    color: "#172e52",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 11,
  },

  datesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dateItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 5,
    gap: 10,
  },

  dateIcon: {
    color: "#078b94",
    fontSize: 19,
    width: 23,
    textAlign: "center",
  },

  dateContent: {
    flex: 1,
  },

  dateLabel: {
    color: "#75878d",
    fontSize: 11,
  },

  dateValue: {
    color: "#172e52",
    fontWeight: "800",
    marginTop: 4,
    fontSize: 13,
  },

  winnerCard: {
    width: 130,
    marginRight: 12,
  },

  winnerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#d9eeee",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  winnerInitial: {
    color: "#078b94",
    fontSize: 27,
    fontWeight: "800",
  },

  winnerName: {
    color: "#172e52",
    fontWeight: "700",
    marginTop: 7,
    fontSize: 13,
  },

  winnerPosition: {
    color: "#078b94",
    fontSize: 11,
    marginTop: 2,
  },

  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e3eaec",
    minWidth: 600,
  },

  activeTabContainer: {
    paddingBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: "#078b94",
    marginRight: 24,
  },

  tabContainer: {
    paddingBottom: 10,
    marginRight: 24,
  },

  activeTab: {
    color: "#078b94",
    fontWeight: "800",
    fontSize: 13,
  },

  tab: {
    color: "#6c7e84",
    fontWeight: "600",
    fontSize: 13,
  },

  description: {
    color: "#64777e",
    lineHeight: 21,
    marginTop: 15,
    fontSize: 13,
  },

  viewMore: {
    color: "#078b94",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },

  rewardsHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  allPositions: {
    color: "#71848a",
    marginLeft: 5,
    marginTop: -10,
    fontSize: 12,
  },

  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f3",
  },

  medal: {
    width: 37,
    fontSize: 18,
  },

  rewardTitle: {
    flex: 1,
    color: "#172e52",
    fontWeight: "700",
    fontSize: 13,
  },

  rewardAmount: {
    color: "#078b94",
    fontWeight: "800",
    fontSize: 15,
  },



  disclaimer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9f7f7",
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 12,
    marginBottom: 11,
  },

  infoIcon: {
    color: "#078b94",
    fontSize: 18,
    marginRight: 8,
  },

  disclaimerText: {
    flex: 1,
    color: "#536b73",
    fontSize: 11,
  },

  infoCardsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 11,
  },

  infoCard: {
    flex: 1,
    minHeight: 88,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e7eef0",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  infoPlay: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: "#d9f4e9",
    alignItems: "center",
    justifyContent: "center",
  },

  infoPlayIcon: {
    color: "#078b94",
    fontSize: 15,
  },

  policyIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#173052",
    alignItems: "center",
    justifyContent: "center",
  },

  policyIconText: {
    color: "#173052",
    fontWeight: "800",
    fontSize: 16,
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoTitle: {
    color: "#172e52",
    fontWeight: "800",
    fontSize: 11,
  },

  infoSubtitle: {
    color: "#73858b",
    fontSize: 9,
    marginTop: 5,
  },

  paymentText: {
    color: "#61757c",
    fontSize: 9,
    marginTop: 7,
  },

  referralCard: {
    backgroundColor: "#e3f9ec",
    borderRadius: 14,
    padding: 12,
    marginBottom: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  referralIcon: {
    width: 42,
    alignItems: "center",
  },

  megaphone: {
    fontSize: 25,
  },

  referralContent: {
    flex: 1,
  },

  referralTitle: {
    color: "#172e52",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 7,
  },

  referralInputRow: {
    flexDirection: "row",
  },

  referralInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d6e4e6",
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
    paddingHorizontal: 8,
    justifyContent: "center",
  },

  referralInputText: {
    color: "#65787f",
    fontSize: 9,
  },

  copyButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d6e4e6",
    paddingHorizontal: 9,
    justifyContent: "center",
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },

  copyText: {
    color: "#078b94",
    fontSize: 9,
    fontWeight: "700",
  },

  referButton: {
    backgroundColor: "#078b94",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 9,
    alignItems: "center",
  },

  referButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

  referSubtext: {
    color: "#d9ffff",
    fontSize: 8,
    marginTop: 3,
  },

  reviewsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e7eef0",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  reviewIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#eef6f7",
    alignItems: "center",
    justifyContent: "center",
  },

  reviewContent: {
    flex: 1,
    marginLeft: 10,
  },

  reviewTitle: {
    color: "#172e52",
    fontWeight: "800",
    fontSize: 13,
  },

  reviewSubtitle: {
    color: "#71838a",
    fontSize: 9,
    marginTop: 3,
  },

  arrow: {
    color: "#172e52",
    fontSize: 28,
  },

  adCard: {
    height: 55,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#cbd9dc",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  adIcon: {
    color: "#7a8c91",
    fontSize: 15,
  },

  adText: {
    color: "#7a8c91",
    fontWeight: "600",
  },

  submitButton: {
    backgroundColor: "#078b94",
    borderRadius: 13,
    paddingVertical: 12,
    alignItems: "center",
  },

  submitButtonDisabled: {
  opacity: 0.55,
},

  submitTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  submitSubtitle: {
    color: "#d9ffff",
    marginTop: 2,
    fontSize: 11,
  },

  bottomNavigation: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 9,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e7eef0",
  },

  bottomNavItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 65,
  },

  bottomNavIcon: {
    color: "#829198",
    fontSize: 22,
  },

  bottomNavLabel: {
    color: "#829198",
    fontSize: 9,
    marginTop: 3,
    marginBottom: 8,
  },

  bottomNavActive: {
    color: "#078b94",
  },

  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#078b94",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    borderWidth: 5,
    borderColor: "#f8fbfc",
  },

  addIcon: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 30,
  },

  bottomSpace: {
    height: 20,
  },
});