"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  ArrowLeft,
  AlertCircle,
  Users,
  Compass,
  Save,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { eventFormSchema, type EventFormInput } from "@/features/events/schemas";
import { createEventAction } from "@/features/events/actions";

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      category: "Touring Akbar",
      description: "",
      coverImageUrl: "",
      locationName: "",
      locationAddress: "",
      mapLink: "",
      startTime: "",
      endTime: "",
      registrationDeadline: "",
      capacity: 50,
      fee: 0,
      status: "published",
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("title", val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", generatedSlug);
  };

  const onSubmit = async (values: EventFormInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await createEventAction(values);
    setIsSubmitting(false);

    if (res.success) {
      router.push("/admin/events");
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-xs text-bone-muted hover:text-muted-gold mb-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Manajemen Event</span>
        </Link>
        <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
          Publikasi Event Touring Baru
        </h1>
        <p className="text-xs text-bone-muted mt-0.5">
          Tentukan rute, batas kuota konvoi, serta biaya pendaftaran per rider.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/60 p-4 text-xs text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informasi Utama */}
        <Card className="border-white/10 bg-asphalt/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Compass className="h-4 w-4 text-muted-gold" />
              <span>Detail Kegiatan & Destinasi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Nama / Judul Kegiatan Touring *</Label>
              <Input
                id="title"
                placeholder="Contoh: Ekspedisi Jalur Lintas Selatan 2026"
                {...register("title")}
                onChange={handleTitleChange}
              />
              {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">URL Slug (Otomatis) *</Label>
              <Input id="slug" {...register("slug")} />
              {errors.slug && <p className="text-xs text-red-400">{errors.slug.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Deskripsi Lengkap & Rencana Rute *</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Jelaskan jarak tempuh KM, etape istirahat, tujuan baksos, dan persiapan khusus..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-400">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lokasi & Tanggal */}
        <Card className="border-white/10 bg-asphalt/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-gold" />
              <span>Jadwal & Titik Kumpul (Meeting Point)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="locationName">Nama Titik Kumpul Start *</Label>
              <Input
                id="locationName"
                placeholder="Contoh: Basecamp Brotherhood Puncak, Bogor"
                {...register("locationName")}
              />
              {errors.locationName && (
                <p className="text-xs text-red-400">{errors.locationName.message}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="mapLink">Tautan Google Maps Titik Kumpul (Opsional)</Label>
              <Input
                id="mapLink"
                placeholder="https://maps.google.com/..."
                {...register("mapLink")}
              />
              {errors.mapLink && <p className="text-xs text-red-400">{errors.mapLink.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startTime">Waktu Mulai Start *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...register("startTime")}
              />
              {errors.startTime && (
                <p className="text-xs text-red-400">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endTime">Waktu Selesai / Finish *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...register("endTime")}
              />
              {errors.endTime && <p className="text-xs text-red-400">{errors.endTime.message}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="registrationDeadline">Batas Akhir Pendaftaran & Pembayaran *</Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                {...register("registrationDeadline")}
              />
              {errors.registrationDeadline && (
                <p className="text-xs text-red-400">{errors.registrationDeadline.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kapasitas & Biaya */}
        <Card className="border-white/10 bg-asphalt/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-gold" />
              <span>Kapasitas Konvoi & Biaya Kontribusi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Batas Maksimal Kuota Peserta (Rider) *</Label>
              <Input
                id="capacity"
                type="number"
                {...register("capacity", { valueAsNumber: true })}
              />
              {errors.capacity && (
                <p className="text-xs text-red-400">{errors.capacity.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fee">Biaya Pendaftaran / Iuran (Rp) *</Label>
              <Input
                id="fee"
                type="number"
                placeholder="0 untuk event gratis"
                {...register("fee", { valueAsNumber: true })}
              />
              {errors.fee && <p className="text-xs text-red-400">{errors.fee.message}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/admin/events">
            <Button variant="outline" type="button">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="font-bold gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menerbitkan Event...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Publikasikan Event Sekarang</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
