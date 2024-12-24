'use client'
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimelineEntry, Agrochemical } from './types';
import { PlusCircle } from 'lucide-react';

interface AddEntryModalProps {
  onAddEntry: (entry: TimelineEntry) => void;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({ onAddEntry }) => {
  const [open, setOpen] = useState(false);
  const [entry, setEntry] = useState<Partial<TimelineEntry>>({
    agrochemicals: [],
  });
  const [agrochemical, setAgrochemical] = useState<Partial<Agrochemical>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleAgrochemicalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAgrochemical(prev => ({ ...prev, [name]: value }));
  };

  const addAgrochemical = () => {
    if (agrochemical.name && agrochemical.type) {
      setEntry(prev => ({
        ...prev,
        agrochemicals: [...(prev.agrochemicals || []), { ...agrochemical, id: Date.now().toString() } as Agrochemical],
      }));
      setAgrochemical({});
    }
  };

  const handleSubmit = () => {
    if (entry.congViec && entry.giaiDoan && entry.ngayThucHien) {
      onAddEntry(entry as TimelineEntry);
      setEntry({ agrochemicals: [] });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm mới công việc</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="congViec" className="text-right">
              Công việc
            </Label>
            <Input
              id="congViec"
              name="congViec"
              value={entry.congViec || ''}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="giaiDoan" className="text-right">
              Giai đoạn
            </Label>
            <Input
              id="giaiDoan"
              name="giaiDoan"
              value={entry.giaiDoan || ''}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ngayThucHien" className="text-right">
              Ngày thực hiện
            </Label>
            <Input
              id="ngayThucHien"
              name="ngayThucHien"
              type="date"
              value={entry.ngayThucHien || ''}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chiPhiCong" className="text-right">
              Chi phí công
            </Label>
            <Input
              id="chiPhiCong"
              name="chiPhiCong"
              type="number"
              value={entry.chiPhiCong || ''}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chiPhiVatTu" className="text-right">
              Chi phí vật tư
            </Label>
            <Input
              id="chiPhiVatTu"
              name="chiPhiVatTu"
              type="number"
              value={entry.chiPhiVatTu || ''}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="muaVu" className="text-right">
              Mùa vụ
            </Label>
            <Select name="muaVu" onValueChange={(value) => handleSelectChange('muaVu', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn mùa vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Xuân Hè">Xuân Hè</SelectItem>
                <SelectItem value="Hè Thu">Hè Thu</SelectItem>
                <SelectItem value="Thu Đông">Thu Đông</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="soLuongCong" className="text-right">
              Số lượng công
            </Label>
            <Input
              id="soLuongCong"
              name="soLuongCong"
              type="number"
              value={entry.soLuongCong || ''}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="soLuongVatTu" className="text-right">
              Số lượng vật tư
            </Label>
            <Input
              id="soLuongVatTu"
              name="soLuongVatTu"
              type="number"
              value={entry.soLuongVatTu || ''}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Vật tư sử dụng</Label>
            <div className="col-span-3 space-y-2">
              <Input
                placeholder="Tên vật tư"
                name="name"
                value={agrochemical.name || ''}
                onChange={handleAgrochemicalChange}
              />
              <Select name="type" onValueChange={(value) => setAgrochemical(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Loại vật tư" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thuốc">Thuốc</SelectItem>
                  <SelectItem value="phân">Phân</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Liều lượng"
                name="lieuLuong"
                value={agrochemical.lieuLuong || ''}
                onChange={handleAgrochemicalChange}
              />
              <Input
                placeholder="Đơn vị tính"
                name="donViTinh"
                value={agrochemical.donViTinh || ''}
                onChange={handleAgrochemicalChange}
              />
              <Button onClick={addAgrochemical} type="button">Thêm vật tư</Button>
            </div>
          </div>
          {entry.agrochemicals && entry.agrochemicals.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Đã thêm:</Label>
              <ul className="col-span-3 list-disc pl-5">
                {entry.agrochemicals.map((item, index) => (
                  <li key={index}>{item.name} - {item.type}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Button onClick={handleSubmit}>Thêm mới công việc</Button>
      </DialogContent>
    </Dialog>
  );
};

export default AddEntryModal;

