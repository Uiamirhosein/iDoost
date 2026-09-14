import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  MapPin,
  Briefcase,
  Heart,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Save,
  Compass,
  AlertOctagon,
  Flame,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { UserProfile, MaritalStatus } from '../types';
import { persianNumber } from '../utils/persianNumbers';
import {
  IRAN_PROVINCES,
  AVAILABLE_INTERESTS,
  AVAILABLE_HOBBIES,
  AVAILABLE_RED_LINES,
  AVAILABLE_LIFESTYLE,
} from '../mockData';

interface ProfileWizardProps {
  initialProfile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onCancel?: () => void;
}

const WIZARD_STEPS = [
  { id: 1, title: 'مشخصات و سکونت', shortTitle: 'سکونت', icon: MapPin },
  { id: 2, title: 'اطلاعات فردی', shortTitle: 'فردی', icon: Briefcase },
  { id: 3, title: 'علاقه‌مندی و تفریحات', shortTitle: 'علایق', icon: Heart },
  { id: 4, title: 'خط قرمزها و بیو', shortTitle: 'معیارها', icon: Sparkles },
];

export const ProfileWizard: React.FC<ProfileWizardProps> = ({
  initialProfile,
  onSaveProfile,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [age, setAge] = useState<number>(initialProfile.age || 28);
  const [gender, setGender] = useState<'female' | 'male'>(initialProfile.gender || 'male');
  const [province, setProvince] = useState<string>(initialProfile.province || 'تهران');
  const [city, setCity] = useState<string>(initialProfile.city || 'تهران');
  const [heightCm, setHeightCm] = useState<number>(initialProfile.heightCm || 180);
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(
    initialProfile.maritalStatus || 'مجرد'
  );
  const [job, setJob] = useState<string>(initialProfile.job || '');
  const [education, setEducation] = useState<string>(initialProfile.education || '');
  const [smokingStatus, setSmokingStatus] = useState<string>(
    initialProfile.smokingStatus || 'اصلاً سیگار نمی‌کشم'
  );
  const [bio, setBio] = useState<string>(initialProfile.bio || '');

  // Chips State
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialProfile.interests || ['هنر و دیزاین', 'تکنولوژی و وب', 'پادکست و کتاب']
  );
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(
    initialProfile.hobbies || ['کافه‌گردی', 'طبیعت‌گردی و کمپ', 'سفر جاده‌ای']
  );
  const [selectedRedLines, setSelectedRedLines] = useState<string[]>(
    initialProfile.redLines || ['دروغ و پنهان‌کاری', 'سیگار و دخانیات', 'بی‌احترامی و پرخاش']
  );
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>(
    initialProfile.lifestyle || ['سحرخیز', 'ورزشکار منظم']
  );

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const toggleChip = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFinish = () => {
    const updated: UserProfile = {
      ...initialProfile,
      age,
      gender,
      province,
      city,
      heightCm,
      maritalStatus,
      job,
      education,
      smokingStatus,
      bio,
      interests: selectedInterests,
      hobbies: selectedHobbies,
      redLines: selectedRedLines,
      lifestyle: selectedLifestyle,
    };
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onCancel) {
        onCancel();
      }
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* 1. Interactive Step Bar */}
      <div className="rounded-3xl bg-[#141522] border border-white/10 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-bold text-white">ویزارد تکمیل گام‌به‌گام</span>
          </div>
          <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
            مرحله {persianNumber(currentStep)} از {persianNumber(WIZARD_STEPS.length)}
          </span>
        </div>

        {/* Step Indicators */}
        <div className="relative flex items-center justify-between mt-2">
          {/* Background Connecting Line */}
          <div className="absolute top-1/2 -translate-y-1/2 inset-x-5 h-1 bg-white/10 rounded-full z-0" />

          {/* Active Filled Line */}
          <div
            className="absolute top-1/2 -translate-y-1/2 right-5 h-1 bg-gradient-to-l from-purple-500 to-indigo-500 rounded-full z-0 transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 82}%`,
            }}
          />

          {/* Step Circles */}
          {WIZARD_STEPS.map((step) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const StepIcon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className="relative z-10 flex flex-col items-center gap-1.5 focus:outline-none group"
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950 border-2 border-emerald-400 font-bold'
                      : isCurrent
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white border-2 border-purple-300 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'bg-[#1b1c2d] text-white/40 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isCurrent
                      ? 'text-purple-300 font-bold'
                      : isDone
                      ? 'text-emerald-400'
                      : 'text-white/40'
                  }`}
                >
                  {step.shortTitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>اطلاعات پروفایل شما با موفقیت در سیستم مچینگ هوشمند ذخیره شد!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Wizard Step Contents */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-4.5 space-y-4 min-h-[320px]">
        <AnimatePresence mode="wait">
          {/* STEP 1: Basic & Location */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                <MapPin className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white">مرحله ۱: موقعیت مکانی، سن و جنسیت</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Age */}
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">سن شما:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAge((prev) => Math.max(18, prev - 1))}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center border border-white/10 active:scale-95"
                    >
                      -
                    </button>
                    <div className="flex-1 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                      {persianNumber(age)} سال
                    </div>
                    <button
                      type="button"
                      onClick={() => setAge((prev) => Math.min(60, prev + 1))}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center border border-white/10 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">جنسیت:</label>
                  <div className="grid grid-cols-2 gap-1.5 h-9">
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`rounded-xl text-xs font-bold border transition-colors flex items-center justify-center ${
                        gender === 'female'
                          ? 'bg-pink-500/25 border-pink-400 text-pink-200 shadow-sm'
                          : 'bg-white/5 border-white/10 text-white/60'
                      }`}
                    >
                      خانم
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`rounded-xl text-xs font-bold border transition-colors flex items-center justify-center ${
                        gender === 'male'
                          ? 'bg-blue-500/25 border-blue-400 text-blue-200 shadow-sm'
                          : 'bg-white/5 border-white/10 text-white/60'
                      }`}
                    >
                      آقا
                    </button>
                  </div>
                </div>
              </div>

              {/* Province & City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">استان سکونت:</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#171826] border border-white/15 px-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {IRAN_PROVINCES.filter((p) => p !== 'همه استان‌ها').map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-white/60 mb-1">شهر / محدوده سکونت:</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثلاً: تهران، ونک"
                    className="w-full h-10 rounded-xl bg-[#171826] border border-white/15 px-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 leading-relaxed">
                💡 موقعیت جغرافیایی شما در تخمین مسافت و نمایش در رادار جستجوی نزدیک‌ترین هم‌صحبت استفاده می‌شود.
              </div>
            </motion.div>
          )}

          {/* STEP 2: Personal, Marital & Career */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                <Briefcase className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white">مرحله ۲: قد، تاهل، تحصیلات و شغل</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Height */}
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">قد (سانتی‌متر):</label>
                  <input
                    type="number"
                    min={140}
                    max={220}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full h-10 rounded-xl bg-[#171826] border border-white/15 px-3 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                {/* Marital Status */}
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">وضعیت تاهل:</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                    className="w-full h-10 rounded-xl bg-[#171826] border border-white/15 px-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="مجرد">مجرد</option>
                    <option value="جدا شده">جدا شده</option>
                    <option value="همسر فوت شده">همسر فوت شده</option>
                  </select>
                </div>
              </div>

              {/* Job & Education */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">شغل / حرفه:</label>
                  <input
                    type="text"
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                    placeholder="مثلاً: طراح گرافیک"
                    className="w-full h-10 rounded-xl bg-[#171826] border border-white/15 px-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/60 mb-1">مدرک تحصیلی:</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="مثلاً: لیسانس معماری"
                    className="w-full h-10 rounded-xl bg-[#171826] border border-white/15 px-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Smoking Status */}
              <div>
                <label className="block text-[11px] text-white/60 mb-1.5">وضعیت مصرف دخانیات:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['اصلاً سیگار نمی‌کشم', 'سیگاری نیستم', 'گاهی یا تفریحی'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSmokingStatus(status)}
                      className={`h-9 rounded-xl text-[10px] sm:text-[11px] font-semibold border transition-all ${
                        smokingStatus === status
                          ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Interests & Hobbies Chips */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                <Heart className="w-4 h-4 text-pink-400" />
                <h3 className="text-xs font-bold text-white">مرحله ۳: انتخاب سلیقه‌ها و اوقات فراغت</h3>
              </div>

              {/* Interests */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-pink-300">
                    علاقه‌مندی‌ها (انتخاب حداقل ۲ مورد):
                  </span>
                  <span className="text-[10px] text-white/40">
                    {persianNumber(selectedInterests.length)} مورد
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto hide-scrollbar p-1">
                  {AVAILABLE_INTERESTS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() =>
                          toggleChip(selectedInterests, setSelectedInterests, interest)
                        }
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-pink-500/30 border-pink-400 text-pink-200 shadow-sm'
                            : 'bg-white/[0.04] border-white/10 text-white/65 hover:bg-white/[0.08]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-pink-300" />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hobbies */}
              <div className="pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-sky-300">
                    تفریحات و فعالیت‌ها (انتخاب حداقل ۲ مورد):
                  </span>
                  <span className="text-[10px] text-white/40">
                    {persianNumber(selectedHobbies.length)} مورد
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto hide-scrollbar p-1">
                  {AVAILABLE_HOBBIES.map((hobby) => {
                    const isSelected = selectedHobbies.includes(hobby);
                    return (
                      <button
                        key={hobby}
                        type="button"
                        onClick={() => toggleChip(selectedHobbies, setSelectedHobbies, hobby)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-sky-500/30 border-sky-400 text-sky-200 shadow-sm'
                            : 'bg-white/[0.04] border-white/10 text-white/65 hover:bg-white/[0.08]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-sky-300" />}
                        <span>{hobby}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Red Lines, Lifestyle & Bio */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white">مرحله ۴: خط قرمزها، سبک زندگی و بیو</h3>
              </div>

              {/* Red Lines */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-rose-300">
                    خط قرمزهای شما در ارتباط:
                  </span>
                  <span className="text-[10px] text-white/40">
                    {persianNumber(selectedRedLines.length)} مورد
                  </span>
                </div>
                <p className="text-[10px] text-white/45 mb-2">
                  سیستم هوشمند افرادی که با خط قرمزهای شما در تضاد هستند را فیلتر خواهد کرد.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_RED_LINES.map((redLine) => {
                    const isSelected = selectedRedLines.includes(redLine);
                    return (
                      <button
                        key={redLine}
                        type="button"
                        onClick={() => toggleChip(selectedRedLines, setSelectedRedLines, redLine)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-rose-500/30 border-rose-400 text-rose-200 shadow-sm'
                            : 'bg-white/[0.04] border-white/10 text-white/65 hover:bg-white/[0.08]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-rose-300" />}
                        <span>{redLine}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lifestyle */}
              <div className="pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-amber-300">
                    سبک زندگی و عادات:
                  </span>
                  <span className="text-[10px] text-white/40">
                    {persianNumber(selectedLifestyle.length)} مورد
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_LIFESTYLE.map((life) => {
                    const isSelected = selectedLifestyle.includes(life);
                    return (
                      <button
                        key={life}
                        type="button"
                        onClick={() => toggleChip(selectedLifestyle, setSelectedLifestyle, life)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-sm'
                            : 'bg-white/[0.04] border-white/10 text-white/65 hover:bg-white/[0.08]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-amber-300" />}
                        <span>{life}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bio */}
              <div className="pt-2 border-t border-white/[0.06]">
                <label className="block text-[11px] font-bold text-white/70 mb-1">
                  معرفی کوتاه و نگرش به زندگی (بیو):
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="چند جمله درباره ویژگی‌های اخلاقی و روحیات خود..."
                  className="w-full rounded-2xl bg-[#171826] border border-white/15 p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Wizard Action Navigation Footer */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {/* Previous Step Button */}
        <button
          type="button"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          className={`h-11 px-4 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
            currentStep === 1
              ? 'opacity-30 cursor-not-allowed border-white/5 text-white/40'
              : 'bg-white/5 hover:bg-white/10 border-white/15 text-white active:scale-95'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
          <span>مرحله قبل</span>
        </button>

        {/* Next / Finish Button */}
        {currentStep < WIZARD_STEPS.length ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.min(WIZARD_STEPS.length, prev + 1))}
            className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span>مرحله بعد</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 active:scale-95 text-white font-black text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره نهایی و ثبت اطلاعات</span>
          </button>
        )}
      </div>
    </div>
  );
};
